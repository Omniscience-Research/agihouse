from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from passlib.hash import sha256_crypt

from flask_app import app
# from flask_app.models import User, Post
# from flask_app.forms import PostForm

@app.route("/")
def index():
    return render_template("index.html")

