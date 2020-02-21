from flask import Flask, render_template, request, jsonify, Response
import io
from src import data, config, sample


app = Flask(__name__)
# TODO: modify README


@app.route('/')
def index():
    return render_template("index.html", **config.CONFIG['Wording'])


@app.route('/help')
def help():
    # TODO: replace video and text
    return render_template("help.html", **config.CONFIG['Wording'])


@app.route('/test')
def test():
    return get_experiment(request.path)


@app.route('/experiment')
def experiment():
    return get_experiment(request.path)


@app.route('/results.png')
def get_visualization():
    # https://stackoverflow.com/questions/50728328
    fig = data.visualize()
    output = io.BytesIO()
    from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
    FigureCanvas(fig).print_png(output)
    return Response(output.getvalue(), mimetype='image/png')


@app.route('/api/results', methods = ['POST'])
def results():
    # TODO: add plot
    exp_results = data.get_results()
    if 'experiment' in request.get_data().decode():
        data.record_to_file(exp_results)
    return render_template(
        "results.html", **config.CONFIG['Wording'],
        show_results=data.format_results(exp_results)
    )


@app.route('/api/sample', methods = ['POST'])
def get_sample():
    data.update(request.get_data())
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
