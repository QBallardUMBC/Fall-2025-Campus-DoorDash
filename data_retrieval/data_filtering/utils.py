import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv

load_dotenv()

def df_records(df: pd.DataFrame):
    return (
        df.replace({np.nan: None})
          .to_dict(orient="records")
    )

