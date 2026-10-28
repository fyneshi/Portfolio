<?php
// Expects $pageTitle, $activePage and optional $basePath ('' or '../')
$basePath = $basePath ?? '';
$links = [
    'home'    => ['Home', 'index.php'],
    'contact' => ['Contact', 'contact.php'],
    'admin'   => ['Admin', 'admin/login.php'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?> | <?= e(OWNER_NAME) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= $basePath ?>css/style.css">
</head>
<body>
<header class="site-header">
    <div class="container nav-wrap">
        <a href="<?= $basePath ?>index.php" class="logo"><?= e(OWNER_NAME) ?></a>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu">
        <label for="nav-toggle" class="nav-toggle-label"><span></span></label>
        <nav class="main-nav">
            <ul>
                <?php foreach ($links as $key => [$label, $href]): ?>
                    <li><a href="<?= $basePath . $href ?>" class="<?= $activePage === $key ? 'active' : '' ?>"><?= $label ?></a></li>
                <?php endforeach; ?>
            </ul>
        </nav>
    </div>
</header>
<main>
