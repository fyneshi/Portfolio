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

<section class="section page-header">
    <div class="container narrow center">
        <h1>Contact Me</h1>
        <p>I'd be happy to hear from you. Let's start with your name.</p>
    </div>
</section>

<section class="section">
    <div class="container form-container">

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
                <p class="step-label">Step 1 of 2</p>
                <h2>What's your name?</h2>
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" maxlength="100" required autofocus
                           value="<?= e($_POST['name'] ?? '') ?>" placeholder="e.g. Juan Dela Cruz">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Submit</button>
            </form>
        <?php else: ?>
            <!-- Step 2: Welcome + contact form -->
            <div class="welcome-banner">
                <h2>Welcome <?= e($visitorName) ?> to my Portfolio!</h2>
                <a href="contact.php?reset=1" class="small-link">Not you? Change name</a>
            </div>

            <?php if ($success): ?>
                <div class="alert alert-success" role="status">
                    Thank you, <?= e($visitorName) ?>! Your message has been sent successfully.
                </div>
            <?php endif; ?>

            <form method="post" class="form-card" novalidate>
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="step" value="message">
                <p class="step-label">Step 2 of 2</p>
                <h2>Send me a message</h2>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" maxlength="100" required
                           value="<?= e($old['email']) ?>" placeholder="you@example.com">
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="6" maxlength="5000" required
                              placeholder="Write your message here..."><?= e($old['message']) ?></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Send Message</button>
            </form>
        <?php endif; ?>

    </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
