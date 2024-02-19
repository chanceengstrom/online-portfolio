from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Home')
@app.route('/fig1')
def fig1():
    return render_template('fig1.html', title='Figure 1')
@app.route('/fig2')
def fig2():
    return render_template('fig2.html', title='Figure 2',)
@app.route('/fig3')
def fig3():
    return render_template('fig3.html', title='Figure 3',)