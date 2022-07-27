# Action nxtlvlsoftware/setup-pmmp-phpstan-env

GitHub action for downloading [PocketMine-MP](https://github.com/pmmp/PocketMine-MP) sources and providing default configs for [PHPStan](https://github.com/phpstan/phpstan) analysis.

| Action Input | Required | Default    | Description                                 |
|--------------|----------|------------|---------------------------------------------|
| install-path | false    | pocketmine | The path to install sources and configs to. |
| pmmp-version | false    | latest     | The target PocketMine sources to install.   |

## How to use
Download a PocketMine-MP.phar to the `install-path` and copy the provided default PHPStan configs:

```yml
name: My Workflow
on: [push]
jobs:
  setup-pmmp-phpstan:
    name: Setup PHPStan
    runs-on: ubuntu-latest
    steps:
      - uses: nxtlvlsoftware/setup-pmmp-phpstan-env@v1
        with:
          pmmp-version: latest
```
