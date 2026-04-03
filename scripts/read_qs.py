import pandas as pd
df = pd.read_excel('2026QSWorldUniversityRankings.xlsx', nrows=5)
print(df.head())
print(df.columns)
