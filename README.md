# Action nxtlvlsoftware/setup-pmmp-phpstan-env

GitHub action for downloading PMMP sources and providing default configs for php-stan analysis.

| Action Input | Required | Default    | Description                                   |
|--------------|----------|------------|-----------------------------------------------|
| install-path | false    | pocketmine | The path to install sources and configs to.   |
| pmmp-version | false    | latest     | The target PMMP sources to install.           |

## How to use
Download a PocketMine-MP.phar to the `install-path` and copy the provided default PHP-Stan configs:

```yml
name: My Workflow
on: [push]
jobs:
  setup-pmmp-phpstan:
    name: Setup PHPStan
    runs-on: ubuntu-latest
    steps:
      - uses: nxtlvlsoftware/setup-phpstan@v1
        with:
          version: 1.4.10
      - run: |
        echo "phpstan version 1.4.10 installed to ${{ outputs.phpstan }}"
      - uses: nxtlvlsoftware/setup-pmmp-phpstan-env@v1
        with:
          pmmp-version: latest
```
