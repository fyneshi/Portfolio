</main>
<footer class="site-footer">
    <div class="container footer-grid">
        <div>
            <a href="<?= $basePath ?>index.php" class="logo logo-light">
                <span class="logo-mark"><?= e($initials) ?></span>
                <span class="logo-text"><?= e(OWNER_NAME) ?></span>
            </a>
            <p class="footer-tagline">Aspiring web developer building clean, functional websites with PHP, MySQL and CSS.</p>
        </div>
        <div>
            <h4>Navigate</h4>
            <ul class="footer-links">
                <?php foreach ($links as [$label, $href]): ?>
                    <li><a href="<?= $basePath . $href ?>"><?= $label ?></a></li>
                <?php endforeach; ?>
            </ul>
        </div>
        <div>
            <h4>Get in touch</h4>
            <p>Have a question or an opportunity?</p>
            <a href="<?= $basePath ?>contact.php" class="footer-cta">Send me a message <?= icon('arrow', 16) ?></a>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="container">
            <p>&copy; <?= date('Y') ?> <?= e(OWNER_NAME) ?>. Built with PHP, MySQL &amp; CSS.</p>
        </div>
    </div>
</footer>
</body>
</html>
