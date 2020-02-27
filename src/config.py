import toml
import matplotlib as mpl


CONFIG_FILE = './config.toml'


CONFIG = toml.load(CONFIG_FILE)
mpl.rcParams.update(CONFIG['Plotting'])
