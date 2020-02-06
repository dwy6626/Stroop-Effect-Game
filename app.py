from flask import Flask, render_template, request
from src import data, config


app = Flask(__name__)


@app.route('/', methods = ['GET', 'POST'])
def index():
    if request.method == 'POST':
        print(request.get_data())
    # else:
    return render_template("index.html")


@app.route('/test')
def test():
    return get_experiment(request.path)


@app.route('/experiment')
def experiment():
    return get_experiment(request.path)


def get_experiment(uri):
    if uri[1:] == 'test':
        title = "試玩局"
    else:
        title = "正式局"
    return render_template("experiment.html", exp_title=title)


if __name__ == '__main__':
    app.run()
