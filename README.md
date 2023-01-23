# Action nxtlvlsoftware/setup-pmmp-phpstan-env-action

GitHub action for downloading [PocketMine-MP](https://github.com/pmmp/PocketMine-MP) sources and providing default configs for [PHPStan](https://github.com/phpstan/phpstan) analysis.

| Action Input | Required | Default    | Description                                 |
|--------------|----------|------------|---------------------------------------------|
| install-path | false    | pocketmine | The path to install sources and configs to. |
| pmmp-version | false    | latest     | The target PocketMine sources to install.   |

## Included configurations
The action will install the contents of the [config](./config) directory to the installation path, making them available
when running phpstan. We bundle custom rules from PocketMine to ensure provided API's are used correctly, and you can choose
to use [phpstan-strict-rules](https://github.com/phpstan/phpstan-strict-rules) which is also provided.

### [pocketmine.phpstan.neon.dist](./config/pocketmine.phpstan.neon.dist)
Installed to `pocketmine/phpstan/pocketmine.phpstan.neon.dist` by default.

This the most basic configuration that simply includes PocketMine's autoloader so classes and types are defined when running
the analysis. You could do this yourself but if using the default installation path simply include this file in your phpstan.neon
file.

### [phpstan.neon.dist](./config/phpstan.neon.dist)
Installed to `pocketmine/phpstan/phpstan.neon.dist` by default.

This the most useful configuration and as such, is used by default. It includes the `pocketmine.phpstan.neon` file and sets
up PocketMines custom rules to ensure code uses custom types and API's correctly.

### [strict.phpstan.neon.dist](./config/phpstan.neon.dist)
Installed to `pocketmine/phpstan/strict.phpstan.neon.dist` by default.

This simply adds [phpstan-strict-rules](https://github.com/phpstan/phpstan-strict-rules) on-top of the [phpstan.neon.dist](./config/phpstan.neon.dist)
configuration. If you don't want to use all the rules, it is possible to selectively enable them as described in the projects README.
Make sure the autoload script in `vendor/autoload.php` is passed to phpstan via the CLI option, and all the rule classes will
be available (you cannot load the rules via a .neon config as phpstan internally resolves the rules for its container BEFORE the `bootstrapFiles` options are loaded.)


## How to use:
Downloads a PocketMine-MP.phar to the `install-path` and copy the provided default PHPStan configs:

```yml
name: My Workflow
on: [push]
jobs:
  setup-pmmp-phpstan:
    name: Setup PHPStan
    runs-on: ubuntu-latest
    steps:
      - uses: nxtlvlsoftware/setup-pmmp-phpstan-env-action@v1
        with:
          pmmp-version: latest
```
