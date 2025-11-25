# Tratamento dos dados

Primeiro coletamos uma amostra dos dados de forma aleatória reduzindo

```bash
$files = Get-ChildItem dados/*.csv
foreach ($f in $files) {
    Get-Content $f.FullName | Get-Random -Count 10000 | Add-Content sample.csv
}
```
