import Foundation
import Vision
import AppKit
import CoreImage

// Usage: swift detect-faces.swift <image1> <image2> ...
// Prints one JSON object per line: {"path":..., "w":..., "h":..., faces:[{...}]}

func loadCGImage(_ path: String) -> (CGImage, Int, Int)? {
    guard let img = NSImage(contentsOfFile: path) else { return nil }
    var rect = CGRect(x: 0, y: 0, width: img.size.width, height: img.size.height)
    guard let cg = img.cgImage(forProposedRect: &rect, context: nil, hints: nil) else { return nil }
    return (cg, cg.width, cg.height)
}

func mean(_ pts: [CGPoint]) -> CGPoint {
    var sx = 0.0, sy = 0.0
    for p in pts { sx += Double(p.x); sy += Double(p.y) }
    let n = Double(pts.count)
    return CGPoint(x: sx/n, y: sy/n)
}

for path in CommandLine.arguments.dropFirst() {
    guard let (cg, w, h) = loadCGImage(path) else {
        print("{\"path\":\"\(path)\",\"error\":\"load_failed\"}")
        continue
    }
    let W = Double(w), H = Double(h)
    let request = VNDetectFaceLandmarksRequest()
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do {
        try handler.perform([request])
    } catch {
        print("{\"path\":\"\(path)\",\"error\":\"perform_failed\"}")
        continue
    }
    var faceJsons: [String] = []
    if let results = request.results {
        for face in results {
            let bb = face.boundingBox // normalized, origin bottom-left
            // pixel bbox (top-left origin)
            let bx = Double(bb.origin.x) * W
            let bw = Double(bb.size.width) * W
            let byTop = (1.0 - Double(bb.origin.y) - Double(bb.size.height)) * H
            let bh = Double(bb.size.height) * H
            let bboxArea = bw * bh

            var eyeJson = "null"
            if let lm = face.landmarks, let le = lm.leftEye, let re = lm.rightEye {
                // landmark points are normalized within boundingBox, origin bottom-left
                func toPixel(_ pts: [CGPoint]) -> [CGPoint] {
                    return pts.map { p in
                        let nx = Double(bb.origin.x) + Double(p.x) * Double(bb.size.width)
                        let ny = Double(bb.origin.y) + Double(p.y) * Double(bb.size.height)
                        let px = nx * W
                        let py = (1.0 - ny) * H
                        return CGPoint(x: px, y: py)
                    }
                }
                let lePx = mean(toPixel(le.normalizedPoints))
                let rePx = mean(toPixel(re.normalizedPoints))
                // Note: Vision's leftEye is the subject's left (image right). We just report both.
                eyeJson = "{\"leftEye\":[\(lePx.x),\(lePx.y)],\"rightEye\":[\(rePx.x),\(rePx.y)]}"
            }
            let fj = "{\"bbox\":[\(bx),\(byTop),\(bw),\(bh)],\"bboxArea\":\(bboxArea),\"eyes\":\(eyeJson)}"
            faceJsons.append(fj)
        }
    }
    print("{\"path\":\"\(path)\",\"w\":\(w),\"h\":\(h),\"faces\":[\(faceJsons.joined(separator: ","))]}")
}
