<?php

// ==========================
// EMERALD KINGDOM
// ==========================

define("APP_NAME", "Emerald Kingdom");
define("APP_TAGLINE", "Where Fortune Meets Glory.");

define("CURRENCY_NAME", "Crown Coin");
define("CURRENCY_SHORT", "CC");
define("CURRENCY_SYMBOL", "♛");

function formatCC($amount)
{
    return CURRENCY_SYMBOL . " " .
           number_format($amount, 0, ',', '.') .
           " " .
           CURRENCY_SHORT;
}

// ==========================
// SAMPLE DATA
// ==========================

$leaderboard = [
    [
        "username" => "Arthur",
        "rank" => "EMPEROR",
        "value" => 250000
    ],
    [
        "username" => "Leon",
        "rank" => "DUKE",
        "value" => 180000
    ],
    [
        "username" => "Sophia",
        "rank" => "MARQUIS",
        "value" => 150000
    ],
    [
        "username" => "Unknown",
        "rank" => "BARON",
        "value" => 100000
    ]
];

$museumItems = [
    [
        "name" => "Golden Crown",
        "rarity" => "LEGENDARY",
        "price" => 500000,
        "winner" => "Arthur"
    ],
    [
        "name" => "Dragon Sword",
        "rarity" => "TRANSCENDENT",
        "price" => 800000,
        "winner" => "Sophia"
    ]
];

$achievements = [
    [
        "name" => "First Victory",
        "description" => "Win your first auction",
        "unlocked" => true
    ],
    [
        "name" => "Legend Hunter",
        "description" => "Collect 50 legendary items",
        "unlocked" => false
    ]
];

$events = [
    [
        "title" => "Golden Dragon Festival",
        "description" => "Special legendary item auctions",
        "end_date" => "2026-12-31"
    ],
    [
        "title" => "Imperial Anniversary",
        "description" => "Double EXP and rewards",
        "end_date" => "2026-10-10"
    ]
];

$faq = [
    [
        "question" => "Apa itu KYC?",
        "answer" => "Verifikasi identitas pengguna."
    ],
    [
        "question" => "Apa itu Anti Sniping?",
        "answer" => "Perpanjangan waktu lelang selama 60 detik jika ada bid terakhir."
    ]
];

// ==========================
// ROUTING SEDERHANA
// ==========================

$page = $_GET['page'] ?? 'home';

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?= APP_NAME ?></title>
</head>
<body>

<h1><?= APP_NAME ?></h1>
<p><?= APP_TAGLINE ?></p>

<hr>

<nav>
    <a href="?page=home">Home</a> |
    <a href="?page=leaderboard">Leaderboard</a> |
    <a href="?page=museum">Museum</a> |
    <a href="?page=achievements">Achievements</a> |
    <a href="?page=events">Events</a> |
    <a href="?page=help">Help</a>
</nav>

<hr>

<?php

// ==========================
// HOME
// ==========================

if ($page == "home") {

    echo "<h2>Welcome to Emerald Kingdom</h2>";
    echo "<p>Where Fortune Meets Glory.</p>";
}

// ==========================
// LEADERBOARD
// ==========================

elseif ($page == "leaderboard") {

    echo "<h2>The Grand Rankings</h2>";

    echo "<h3>Top 3 Podium</h3>";

    echo "<ol>";
    echo "<li>" . $leaderboard[0]['username'] . " (" . $leaderboard[0]['rank'] . ")</li>";
    echo "<li>" . $leaderboard[1]['username'] . " (" . $leaderboard[1]['rank'] . ")</li>";
    echo "<li>" . $leaderboard[2]['username'] . " (" . $leaderboard[2]['rank'] . ")</li>";
    echo "</ol>";

    echo "<table border='1' cellpadding='8'>";

    echo "
    <tr>
        <th>#</th>
        <th>Username</th>
        <th>Rank</th>
        <th>Score</th>
    </tr>";

    foreach ($leaderboard as $index => $user) {

        echo "<tr>";

        echo "<td>" . ($index + 1) . "</td>";
        echo "<td>" . $user['username'] . "</td>";
        echo "<td>" . $user['rank'] . "</td>";
        echo "<td>" . number_format($user['value']) . "</td>";

        echo "</tr>";
    }

    echo "</table>";
}

// ==========================
// MUSEUM
// ==========================

elseif ($page == "museum") {

    echo "<h2>The Imperial Museum</h2>";

    foreach ($museumItems as $item) {

        echo "<hr>";

        echo "<h3>" . $item['name'] . "</h3>";

        echo "<p>Rarity : " . $item['rarity'] . "</p>";

        echo "<p>Final Price : "
            . formatCC($item['price'])
            . "</p>";

        echo "<p>Winner : "
            . $item['winner']
            . "</p>";
    }
}

// ==========================
// ACHIEVEMENTS
// ==========================

elseif ($page == "achievements") {

    echo "<h2>The Triumph Registry</h2>";

    foreach ($achievements as $achievement) {

        echo "<hr>";

        echo "<h3>"
            . $achievement['name']
            . "</h3>";

        echo "<p>"
            . $achievement['description']
            . "</p>";

        echo "<p>Status : ";

        echo $achievement['unlocked']
            ? "Unlocked"
            : "Locked";

        echo "</p>";
    }
}

// ==========================
// EVENTS
// ==========================

elseif ($page == "events") {

    echo "<h2>Festival Calendar</h2>";

    foreach ($events as $event) {

        echo "<hr>";

        echo "<h3>"
            . $event['title']
            . "</h3>";

        echo "<p>"
            . $event['description']
            . "</p>";

        echo "<p>Ends: "
            . $event['end_date']
            . "</p>";
    }
}

// ==========================
// HELP / FAQ
// ==========================

elseif ($page == "help") {

    echo "<h2>Help & FAQ</h2>";

    foreach ($faq as $item) {

        echo "<details>";

        echo "<summary>"
            . $item['question']
            . "</summary>";

        echo "<p>"
            . $item['answer']
            . "</p>";

        echo "</details>";

        echo "<br>";
    }

    echo "<hr>";

    echo "<h3>Support</h3>";

    echo "<p>Email: support@emeraldkingdom.com</p>";
}

// ==========================
// 404
// ==========================

else {

    http_response_code(404);

    echo "<h1>404</h1>";

    echo "<p>";
    echo "The path you seek lies beyond the known kingdom.";
    echo "</p>";

    echo "<a href='?page=home'>";
    echo "Return to Kingdom";
    echo "</a>";
}

?>

<hr>

<footer>
    <p>
        <?= APP_NAME ?> © <?= date('Y') ?>
    </p>
</footer>

</body>
</html>