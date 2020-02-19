# Stroop Effect Game

(In traditional Chinese)\
Mimicking experiment I in studies of J. Ridley Stroop, published in *Studies of Interference in Serial Verbal Reactions*. 

![](./image/preview.gif)
![](./image/preview.png)

Example of experiment result:

![](./image/example.png)


## Environment Setup

This app is developed under Python 3, tested with Google Chrome 80.0.3987.87, macOS 10.15.

### Install requirements

```bash
pip install -r requirements.txt
```

### Customization

modify `config.toml`

- `experiment_type`: which experiment in Stroop's work (`1` or `2`) 
- `test`: how many runs in pre-testing
- `experiment`: how many runs in formal testing
- `filter`: discard outliers? (in measured time difference)
- `outlier_over_std`: tolerance for data, deviating from mean
- `min_data_filter`: discard outliers when collected data > this value
- `output_file`:  test result will append to this file in `.csv` format


## Usage

### Run the application

```bash
flask run
```

### Spec
![](./image/stroop-effect-game-spec.jpg)
