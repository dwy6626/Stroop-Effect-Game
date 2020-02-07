from flask import Flask, render_template, request
from src import data, config


app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html", **config.CONFIG['Wording'])


@app.route('/test')
def test():
    return get_experiment(request.path)


@app.route('/experiment')
def experiment():
    return get_experiment(request.path)


@app.route('/results')
def results():
    return render_template("results.html", **config.CONFIG['Wording'], show_results="")


@app.route('/api/record', methods = ['POST'])
def record():
    return "true"


@app.route('/api/config', methods = ['POST'])
def get_config():
    exp_type = request.get_data().decode()
    return str(config.CONFIG['Setting'][exp_type[1:]])


def get_experiment(uri):
    return render_template("experiment.html", exp_title=config.CONFIG['Wording'][uri[1:]])


if __name__ == '__main__':
    app.run()
