from flask import Flask, render_template, request


app = Flask(__name__)


@app.route('/', methods = ['GET', 'POST'])
def index():
    if request.method == 'POST':
        print(request.get_data())
    # else:
    return render_template("index.html")


@app.route('/test')
def test():
    return render_template("experiment.html", exp_title="試玩局")


@app.route('/experiment')
def experiment():
    return render_template("experiment.html", exp_title="正式局")


if __name__ == '__main__':
    app.run()
