<?php
require_once __DIR__ . '/config.php';

$pageTitle  = 'Contact';
$activePage = 'contact';

$errors = [];
$old    = ['email' => '', 'message' => ''];

// "Not you?" — clear the stored name and start over
if (isset($_GET['reset'])) {
    unset($_SESSION['visitor_name']);
    header('Location: contact.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valid()) {
        $errors[] = 'Your session expired. Please try again.';
    } elseif (($_POST['step'] ?? '') === 'name') {
        // Step 1: ask for the visitor's name
        $name = trim($_POST['name'] ?? '');
        if ($name === '') {
            $errors[] = 'Please enter your name.';
        } elseif (mb_strlen($name) > 100) {
            $errors[] = 'Name must be 100 characters or fewer.';
        } elseif (!preg_match("/^[\p{L}\p{M} .'-]+$/u", $name)) {
            $errors[] = 'Name may only contain letters, spaces, periods, apostrophes and hyphens.';
        } else {
            $_SESSION['visitor_name'] = $name;
            header('Location: contact.php');
            exit;
        }
    } elseif (($_POST['step'] ?? '') === 'message' && isset($_SESSION['visitor_name'])) {
        // Step 2: save the contact message
        $old['email']   = trim($_POST['email'] ?? '');
        $old['message'] = trim($_POST['message'] ?? '');

        if ($old['email'] === '') {
            $errors[] = 'Please enter your email address.';
        } elseif (!filter_var($old['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($old['email']) > 100) {
            $errors[] = 'Please enter a valid email address.';
        }
        if ($old['message'] === '') {
            $errors[] = 'Please enter a message.';
        } elseif (mb_strlen($old['message']) > 5000) {
            $errors[] = 'Message must be 5000 characters or fewer.';
        }

        if (!$errors) {
            $pdo = db();
            if ($pdo === null) {
                $errors[] = 'Sorry, we could not connect to the database. Please try again later.';
            } else {
                try {
                    $stmt = $pdo->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
                    $stmt->execute([$_SESSION['visitor_name'], $old['email'], $old['message']]);
                    $_SESSION['flash_success'] = true;
                    header('Location: contact.php');
                    exit;
                } catch (PDOException $e) {
                    error_log('Insert failed: ' . $e->getMessage());
                    $errors[] = 'Sorry, your message could not be sent. Please try again later.';
                }
            }
        }
    }
}

$visitorName = $_SESSION['visitor_name'] ?? null;
$success     = !empty($_SESSION['flash_success']);
unset($_SESSION['flash_success']);

require __DIR__ . '/includes/header.php';
?>

<section class="page-header">
    <div class="container narrow center">
        <p class="eyebrow">Contact</p>
        <h1>Let's get in touch</h1>
        <p>I'd be happy to hear from you. Start by telling me your name.</p>
    </div>
</section>

<section class="section">
    <div class="container contact-grid">

        <aside class="info-panel">
            <h2>Why reach out?</h2>
            <p>Whether you have a question, feedback or an opportunity, I'd love to hear about it.</p>
            <ul class="info-list">
                <li><span><?= icon('user', 18) ?></span> Tell me your name</li>
                <li><span><?= icon('mail', 18) ?></span> Leave your email and message</li>
                <li><span><?= icon('shield', 18) ?></span> Your details are stored securely</li>
                <li><span><?= icon('check', 18) ?></span> I'll get back to you by email</li>
            </ul>
        </aside>

        <div class="contact-main">
            <ol class="stepper" aria-label="Progress">
                <li class="<?= $visitorName === null ? 'active' : 'done' ?>">
                    <span class="step-dot"><?= $visitorName === null ? '1' : icon('check', 16) ?></span> Your name
                </li>
                <li class="<?= $visitorName === null ? '' : 'active' ?>">
                    <span class="step-dot">2</span> Your message
                </li>
            </ol>

            <?php if ($errors): ?>
                <div class="alert alert-error" role="alert">
                    <ul>
                        <?php foreach ($errors as $error): ?>
                            <li><?= e($error) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <?php if ($visitorName === null): ?>
                <!-- Step 1: Name -->
                <form method="post" class="form-card" novalidate>
                    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="step" value="name">
                    <h2>What's your name?</h2>
                    <p class="muted">So I know who I'm talking to.</p>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <div class="input-icon">
                            <?= icon('user', 18) ?>
                            <input type="text" id="name" name="name" maxlength="100" required autofocus
                                   value="<?= e($_POST['name'] ?? '') ?>" placeholder="e.g. Juan Dela Cruz">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Submit <?= icon('arrow', 18) ?></button>
                </form>
            <?php else: ?>
                <!-- Step 2: Welcome + contact form -->
                <div class="welcome-banner">
                    <h2>Welcome <?= e($visitorName) ?> to my Portfolio!</h2>
                    <a href="contact.php?reset=1" class="small-link">Not you? Change name</a>
                </div>

                <?php if ($success): ?>
                    <div class="alert alert-success" role="status">
                        <?= icon('check', 18) ?>
                        <span>Thank you, <?= e($visitorName) ?>! Your message has been sent successfully.</span>
                    </div>
                <?php endif; ?>

                <form method="post" class="form-card" novalidate>
                    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="step" value="message">
                    <h2>Send me a message</h2>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <div class="input-icon">
                            <?= icon('mail', 18) ?>
                            <input type="email" id="email" name="email" maxlength="100" required
                                   value="<?= e($old['email']) ?>" placeholder="you@example.com">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="6" maxlength="5000" required
                                  placeholder="Write your message here..."><?= e($old['message']) ?></textarea>
                        <small class="char-count" data-for="message"></small>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Send Message <?= icon('arrow', 18) ?></button>
                </form>
            <?php endif; ?>
        </div>

    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
