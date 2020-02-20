from flask import Flask, render_template, request, jsonify
from src import data, config, sample


app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html", **config.CONFIG['Wording'])


@app.route('/help')
def help():
    return render_template("help.html", **config.CONFIG['Wording'])


@app.route('/test')
def test():
    return get_experiment(request.path)


@app.route('/experiment')
def experiment():
    return get_experiment(request.path)


@app.route('/api/results', methods = ['POST'])
def results():
    exp_results = data.get_results()
    if 'experiment' in request.get_data().decode():
        data.record_to_file(exp_results)
    return render_template(
        "results.html", **config.CONFIG['Wording'],
        show_results=data.format_results(exp_results)
    )


@app.route('/api/record', methods = ['POST'])
def record():
    data.update(request.get_data())
    return "true"


@app.route('/api/sample')
def get_sample():
    return jsonify(sample.get_sample())


@app.route('/api/config')
def get_config():
    return jsonify(config.CONFIG)


def get_experiment(path):
    data.clear()
    sample.reset(path)
    return render_template(
        "experiment.html",
        exp_title=config.CONFIG['Wording'][path[1:]],
        **config.CONFIG['Wording']
    )


if __name__ == '__main__':
    app.run()
