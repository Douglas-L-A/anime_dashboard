import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from pipelines.curate.curate_animes import main


if __name__ == '__main__':
    main()