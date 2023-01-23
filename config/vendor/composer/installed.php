<?php return array(
    'root' => array(
        'pretty_version' => 'dev-master',
        'version' => 'dev-master',
        'type' => 'library',
        'install_path' => __DIR__ . '/../../',
        'aliases' => array(),
        'reference' => '9d72f6d0fc9122f25cc7982cd3a2b915b2ee11dc',
        'name' => 'nxtlvlsoftware/setup-pmmp-phpstan-env',
        'dev' => true,
    ),
    'versions' => array(
        'nxtlvlsoftware/setup-pmmp-phpstan-env' => array(
            'pretty_version' => 'dev-master',
            'version' => 'dev-master',
            'type' => 'library',
            'install_path' => __DIR__ . '/../../',
            'aliases' => array(),
            'reference' => '9d72f6d0fc9122f25cc7982cd3a2b915b2ee11dc',
            'dev_requirement' => false,
        ),
        'phpstan/phpstan' => array(
            'dev_requirement' => false,
            'replaced' => array(
                0 => '*',
            ),
        ),
        'phpstan/phpstan-strict-rules' => array(
            'pretty_version' => '1.3.0',
            'version' => '1.3.0.0',
            'type' => 'phpstan-extension',
            'install_path' => __DIR__ . '/../phpstan/phpstan-strict-rules',
            'aliases' => array(),
            'reference' => '543675a9be82d4befb9ca0bd8cdc9d211665037f',
            'dev_requirement' => true,
        ),
    ),
);
