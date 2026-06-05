<?php

// ==========================
// EMERALD KINGDOM CONFIG
// ==========================

define("APP_NAME", "Emerald Kingdom");
define("APP_TAGLINE", "Where Fortune Meets Glory.");

define("CURRENCY_NAME", "Crown Coin");
define("CURRENCY_SHORT", "CC");
define("CURRENCY_SYMBOL", "♛");

function formatCC($amount)
{
    return CURRENCY_SYMBOL . " " . number_format($amount, 0, ',', '.') . " " . CURRENCY_SHORT;
}

// ==========================
// SAMPLE DATA
// ==========================

$leaderboard = [
    ["username" => "Arthur", "rank" => "EMPEROR", "value" => 250000],
    ["username" => "Leon", "rank" => "DUKE", "value" => 180000],
    ["username" => "Sophia", "rank" => "MARQUIS", "value" => 150000],
    ["username" => "Unknown", "rank" => "BARON", "value" => 100000]
];

$museumItems = [
    ["name" => "Golden Crown", "rarity" => "LEGENDARY", "price" => 500000, "winner" => "Arthur"],
    ["name" => "Dragon Sword", "rarity" => "TRANSCENDENT", "price" => 800000, "winner" => "Sophia"]
];

$achievements = [
    ["name" => "First Victory", "description" => "Win your first auction", "unlocked" => true],
    ["name" => "Legend Hunter", "description" => "Collect 50 legendary items", "unlocked" => false]
];

$events = [
    ["title" => "Golden Dragon Festival", "description" => "Special legendary item auctions", "end_date" => "2026-12-31"],
    ["title" => "Imperial Anniversary", "description" => "Double EXP and rewards", "end_date" => "2026-10-10"]
];

$faq = [
    ["question" => "Apa itu KYC?", "answer" => "Verifikasi identitas pengguna untuk menjaga keamanan kerajaan."],
    ["question" => "Apa itu Anti Sniping?", "answer" => "Perpanjangan waktu lelang selama 60 detik jika ada penawaran (bid) di menit-menit terakhir."]
];

$page = $_GET['page'] ?? 'home';

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=initial-scale=1.0">
    <title><?= APP_NAME ?> — <?= APP_TAGLINE ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@500;700&family=Lato:wght@400;700&family=Orbitron:wght@600;800&display=swap" rel="stylesheet">

    <style>
        /* ==========================================================================
           VISUAL SYSTEM STYLING (globals.css core integrated)
           ========================================================================== */
        :root {
            /* Background */
            --color-bg-deep:          #0D3B2E;
            --color-bg-mid:           #0A2620;
            --color-bg-dark:          #050508;

            /* Aksen Utama */
            --color-gold:             #C9A84C;
            --color-gold-bright:      #E8A020;
            --color-gold-light:       #F5D080;
            --color-ivory:            #F5F0E8;

            /* Aksen Khusus */
            --color-crimson:          #8B1A1A;
            --color-sapphire:         #1A3A6B;
            --color-silver:           #C0C0C0;
            --color-bronze:           #CD7F32;

            /* Rank Accent Default */
            --color-rank-accent:      #C9A84C;
            --color-rank-glow:        rgba(201, 168, 76, 0.3);

            /* Rarity Styles */
            --color-rarity-common:      #9E9E9E;
            --color-rarity-uncommon:    #4CAF50;
            --color-rarity-rare:        #2196F3;
            --color-rarity-epic:        #9C27B0;
            --color-rarity-legendary:   #FF9800;
            --color-rarity-transcendent:#F44336;

            /* Fonts */
            --font-heading:    'Cinzel Decorative', serif;
            --font-subheading: 'Cinzel', serif;
            --font-body:       'Lato', sans-serif;
            --font-numeric:    'Orbitron', monospace;
        }

        /* Reset & Base HTML Styles */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: var(--font-body);
            color: var(--color-ivory);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            line-height: 1.6;
            
            /* Layer 1 & 2: Background Animated with subtle noise vibe */
            background: linear-gradient(160deg, var(--color-bg-deep) 0%, var(--color-bg-mid) 40%, var(--color-bg-dark) 100%);
            background-size: 200% 200%;
            animation: gradient-breathe 12s ease infinite;
        }

        /* Layer 3: Vignette Effect overlay */
        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle, transparent 30%, rgba(5,5,8,0.6) 100%);
            pointer-events: none;
            z-index: 1;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 2;
            flex: 1;
        }

        /* Animations */
        @keyframes gradient-breathe {
            0%   { background-position: 0% 0%; }
            50%  { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
        }

        @keyframes gold-shimmer {
            0%   { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }

        @keyframes aura-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(201, 168, 76, 0.4), 0 0 40px rgba(201, 168, 76, 0.15); }
            50% { box-shadow: 0 0 25px rgba(201, 168, 76, 0.6), 0 0 60px rgba(201, 168, 76, 0.3); }
        }

        /* Brand & Header components */
        header {
            text-align: center;
            padding: 3rem 0 1.5rem;
        }

        .brand-title {
            font-family: var(--font-heading);
            font-size: 3.5rem;
            letter-spacing: 2px;
            margin-bottom: 0.5rem;
            background: linear-gradient(90deg, #C9A84C 0%, #E8A020 40%, #F5D080 65%, #C9A84C 100%);
            background-size: 200% 100%;
            animation: gold-shimmer 4s linear infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(232, 160, 32, 0.2);
        }

        .brand-tagline {
            font-family: var(--font-subheading);
            font-size: 1.1rem;
            color: var(--color-gold-light);
            text-transform: uppercase;
            letter-spacing: 4px;
            opacity: 0.85;
        }

        /* Luxury Navigation */
        nav {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 2rem 0;
            border-top: 1px solid rgba(201, 168, 76, 0.2);
            border-bottom: 1px solid rgba(201, 168, 76, 0.2);
            padding: 0.75rem 0;
        }

        nav a {
            font-family: var(--font-subheading);
            color: var(--color-ivory);
            text-decoration: none;
            padding: 0.5rem 1.25rem;
            font-size: 0.95rem;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            border-radius: 4px;
            text-transform: uppercase;
        }

        nav a:hover, nav a.active {
            color: var(--color-gold-bright);
            background: rgba(201, 168, 76, 0.1);
            text-shadow: 0 0 8px rgba(232, 160, 32, 0.4);
        }

        /* Headings & Layout Modules */
        h2 {
            font-family: var(--font-subheading);
            font-size: 2.2rem;
            color: var(--color-gold);
            margin-bottom: 2rem;
            text-align: center;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        h3 {
            font-family: var(--font-subheading);
            font-size: 1.4rem;
            color: var(--color-ivory);
            margin-bottom: 1rem;
        }

        /* Card System (Premium Velvet Vibe) */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .kingdom-card {
            background: rgba(10, 38, 32, 0.6);
            border: 1px solid rgba(201, 168, 76, 0.15);
            border-radius: 8px;
            padding: 2rem;
            position: relative;
            backdrop-filter: blur(8px);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .kingdom-card:hover {
            transform: translateY(-5px);
            border-color: var(--color-gold);
        }

        /* Premium Rarity Border & Aura */
        .rarity-border-legendary { 
            border: 1px solid var(--color-rarity-legendary);
            box-shadow: 0 0 15px rgba(255,152,0,0.2);
        }
        .rarity-border-transcendent { 
            border: 1px solid var(--color-rarity-transcendent);
            box-shadow: 0 0 15px rgba(244,67,54,0.2);
        }

        /* Leaderboard Table Stylings */
        .table-wrapper {
            overflow-x: auto;
            background: rgba(5, 5, 8, 0.5);
            border-radius: 8px;
            border: 1px solid rgba(201, 168, 76, 0.15);
            margin-top: 2rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            font-family: var(--font-subheading);
            background: rgba(13, 59, 46, 0.8);
            color: var(--color-gold);
            padding: 1rem 1.5rem;
            font-size: 1rem;
            letter-spacing: 1px;
            border-bottom: 2px solid rgba(201, 168, 76, 0.3);
        }

        td {
            padding: 1.2rem 1.5rem;
            border-bottom: 1px solid rgba(201, 168, 76, 0.1);
            font-size: 1rem;
        }

        tr:hover td {
            background: rgba(13, 59, 46, 0.3);
        }

        /* Badges & Micro-elements */
        .badge {
            font-family: var(--font-subheading);
            font-size: 11px;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            text-transform: uppercase;
        }

        .badge-common { background: rgba(158,158,158,0.15); color: var(--color-rarity-common); border: 1px solid var(--color-rarity-common); }
        .badge-unlocked { background: rgba(76,175,80,0.15); color: var(--color-rarity-uncommon); border: 1px solid var(--color-rarity-uncommon); }
        .badge-locked { background: rgba(244,67,54,0.15); color: var(--color-rarity-transcendent); border: 1px solid var(--color-rarity-transcendent); }
        .badge-legendary { background: rgba(255,152,0,0.15); color: var(--color-rarity-legendary); border: 1px solid var(--color-rarity-legendary); }
        .badge-transcendent { background: rgba(244,67,54,0.15); color: var(--color-rarity-transcendent); border: 1px solid var(--color-rarity-transcendent); }

        .price-tag {
            font-family: var(--font-numeric);
            font-size: 1.3rem;
            color: var(--color-gold-bright);
            margin: 0.75rem 0;
            text-shadow: 0 0 10px rgba(232, 160, 32, 0.3);
        }

        /* SVG Icon Utilities */
        .k-icon {
            width: 1.25rem;
            height: 1.25rem;
            vertical-align: middle;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        
        .nav-item-flex {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Podium Layout */
        .podium-container {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 1.5rem;
            margin: 3rem 0;
            padding-bottom: 1rem;
        }

        .podium-step {
            background: linear-gradient(135deg, rgba(13,59,46,0.8) 0%, rgba(5,5,8,0.9) 100%);
            border: 1px solid rgba(201, 168, 76, 0.3);
            border-radius: 8px 8px 4px 4px;
            padding: 1.5rem;
            text-align: center;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .podium-1 { order: 2; height: 180px; width: 160px; border-color: var(--color-gold); animation: aura-pulse 3s ease-in-out infinite;}
        .podium-2 { order: 1; height: 140px; width: 140px; border-color: var(--color-silver);}
        .podium-3 { order: 3; height: 110px; width: 140px; border-color: var(--color-bronze);}

        .podium-number {
            font-family: var(--font-numeric);
            font-size: 2rem;
            font-weight: 800;
            display: block;
            margin-bottom: 0.5rem;
        }
        .podium-1 .podium-number { color: var(--color-gold-bright); }
        .podium-2 .podium-number { color: var(--color-silver); }
        .podium-3 .podium-number { color: var(--color-bronze); }

        /* FAQ Accordion Styling */
        details {
            background: rgba(10, 38, 32, 0.5);
            border: 1px solid rgba(201, 168, 76, 0.15);
            border-radius: 6px;
            padding: 1rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        }

        details[open] {
            border-color: var(--color-gold);
            background: rgba(13, 59, 46, 0.6);
        }

        summary {
            font-family: var(--font-subheading);
            color: var(--color-ivory);
            cursor: pointer;
            font-weight: bold;
            outline: none;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        summary:hover { color: var(--color-gold-light); }

        details p {
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(201, 168, 76, 0.1);
            color: rgba(245, 240, 232, 0.8);
        }

        /* 404 Layout */
        .error-view {
            text-align: center;
            padding: 4rem 1rem;
        }
        .error-code {
            font-family: var(--font-numeric);
            font-size: 6rem;
            color: var(--color-crimson);
            text-shadow: 0 0 20px rgba(139,26,26,0.4);
            line-height: 1;
            margin-bottom: 1rem;
        }

        .cta-btn {
            display: inline-block;
            margin-top: 2rem;
            padding: 0.8rem 2rem;
            font-family: var(--font-subheading);
            color: var(--color-bg-dark);
            font-weight: bold;
            text-decoration: none;
            border-radius: 4px;
            background: linear-gradient(90deg, #C9A84C 0%, #E8A020 40%, #F5D080 65%, #C9A84C 100%);
            background-size: 200% 100%;
            animation: gold-shimmer 3s linear infinite;
            box-shadow: 0 4px 15px rgba(232, 160, 32, 0.3);
            transition: transform 0.2s ease;
        }
        .cta-btn:hover { transform: scale(1.03); }

        footer {
            text-align: center;
            padding: 3rem 0;
            margin-top: auto;
            border-top: 1px solid rgba(201, 168, 76, 0.1);
            font-size: 0.85rem;
            color: rgba(245, 240, 232, 0.5);
            letter-spacing: 1px;
        }

        /* Reduced Motion Fallback */
        @media (prefers-reduced-motion: reduce) {
            body, .brand-title, .cta-btn, .podium-1 { animation: none !important; background-size: auto !important; }
        }
    </style>
</head>
<body>

<svg style="display: none;">
    <g id="icon-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></g>
    <g id="icon-podium"><path d="M4 22V10h4v12"/><path d="M10 22V4h4v12"/><path d="M16 22v-8h4v8"/><path d="M2 22h20"/></g>
    <g id="icon-museum"><path d="m2 22 1-4h18l1 4"/><path d="M5 12v4"/><path d="M9 12v4"/><path d="M13 12v4"/><path d="M17 12v4"/><path d="M2 8h20"/><path d="m12 2-10 6h20Z"/></g>
    <g id="icon-scroll"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></g>
    <g id="icon-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></g>
    <g id="icon-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></g>
    <g id="icon-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></g>
    <g id="icon-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g>
</svg>

<div class="container">
    <header>
        <h1 class="brand-title"><?= APP_NAME ?></h1>
        <p class="brand-tagline"><?= APP_TAGLINE ?></p>
    </header>

    <nav>
        <a href="?page=home" class="nav-item-flex <?= $page=='home'?'active':'' ?>"><svg class="k-icon"><use href="#icon-home"/></svg> Home</a>
        <a href="?page=leaderboard" class="nav-item-flex <?= $page=='leaderboard'?'active':'' ?>"><svg class="k-icon"><use href="#icon-podium"/></svg> Leaderboard</a>
        <a href="?page=museum" class="nav-item-flex <?= $page=='museum'?'active':'' ?>"><svg class="k-icon"><use href="#icon-museum"/></svg> Museum</a>
        <a href="?page=achievements" class="nav-item-flex <?= $page=='achievements'?'active':'' ?>"><svg class="k-icon"><use href="#icon-scroll"/></svg> Achievements</a>
        <a href="?page=events" class="nav-item-flex <?= $page=='events'?'active':'' ?>"><svg class="k-icon"><use href="#icon-calendar"/></svg> Events</a>
        <a href="?page=help" class="nav-item-flex <?= $page=='help'?'active':'' ?>"><svg class="k-icon"><use href="#icon-shield"/></svg> Help</a>
    </nav>

    <main>
    <?php

    // ==========================
    // MODULE: HOME
    // ==========================
    if ($page == "home") {
        echo "<div style='text-align: center; padding: 4rem 0;'>";
        echo "<h2>Welcome to the Grand Arena</h2>";
        echo "<p style='max-width: 600px; margin: 0 auto; color: rgba(245,240,232,0.8); font-size: 1.1rem;'>
                Langkah Anda di dalam dunia lelang premium ini menandai awal pencarian harta karun mistis dan kejayaan mutlak. Bersiaplah untuk menawar dengan bijak demi mendapatkan relik kuno kaisar.
              </p>";
        echo "<a href='?page=museum' class='cta-btn'>Jelajahi Museum</a>";
        echo "</div>";
    }

    // ==========================
    // MODULE: LEADERBOARD
    // ==========================
    elseif ($page == "leaderboard") {
        echo "<h2>The Grand Rankings</h2>";

        // Premium Podium Presentation
        echo "<div class='podium-container'>";
        echo "  <div class='podium-step podium-1'>
                    <span class='podium-number'>1</span>
                    <strong>" . htmlspecialchars($leaderboard[0]['username']) . "</strong>
                    <div style='font-size: 0.8rem; color: var(--color-gold-light); margin-top: 4px;'>" . $leaderboard[0]['rank'] . "</div>
                </div>";
        echo "  <div class='podium-step podium-2'>
                    <span class='podium-number'>2</span>
                    <strong>" . htmlspecialchars($leaderboard[1]['username']) . "</strong>
                    <div style='font-size: 0.8rem; color: var(--color-silver); margin-top: 4px;'>" . $leaderboard[1]['rank'] . "</div>
                </div>";
        echo "  <div class='podium-step podium-3'>
                    <span class='podium-number'>3</span>
                    <strong>" . htmlspecialchars($leaderboard[2]['username']) . "</strong>
                    <div style='font-size: 0.8rem; color: var(--color-bronze); margin-top: 4px;'>" . $leaderboard[2]['rank'] . "</div>
                </div>";
        echo "</div>";

        // Complete Rank Table
        echo "<div class='table-wrapper'>";
        echo "<table>";
        echo "<thead>
                <tr>
                    <th style='width: 80px;'>#</th>
                    <th>Username</th>
                    <th>Rank Aura</th>
                    <th style='text-align: right;'>Score Value</th>
                </tr>
              </thead>
              <tbody>";

        foreach ($leaderboard as $index => $user) {
            echo "<tr>";
            echo "<td style='font-family: var(--font-numeric);'>" . ($index + 1) . "</td>";
            echo "<td style='font-weight: bold;'>" . htmlspecialchars($user['username']) . "</td>";
            echo "<td><span class='badge' style='background: rgba(201, 168, 76, 0.1); color: var(--color-gold); border: 1px solid rgba(201, 168, 76, 0.3);'><svg class='k-icon' style='width:0.85rem; height:0.85rem;'><use href=\"#icon-user\"/></svg> " . $user['rank'] . "</span></td>";
            echo "<td style='text-align: right; font-family: var(--font-numeric); font-weight: bold; color: var(--color-gold-light);'>" . number_format($user['value'], 0, ',', '.') . "</td>";
            echo "</tr>";
        }

        echo "</tbody></table></div>";
    }

    // ==========================
    // MODULE: MUSEUM
    // ==========================
    elseif ($page == "museum") {
        echo "<h2>The Imperial Museum</h2>";
        echo "<div class='card-grid'>";

        foreach ($museumItems as $item) {
            $rarityClass = 'rarity-border-' . strtolower($item['rarity']);
            $badgeClass = 'badge-' . strtolower($item['rarity']);

            echo "<div class='kingdom-card {$rarityClass}'>";
            echo "  <span class='badge {$badgeClass}'>" . $item['rarity'] . "</span>";
            echo "  <h3 style='margin-top: 1rem; color: var(--color-gold-light);'>" . htmlspecialchars($item['name']) . "</h3>";
            echo "  <div class='price-tag'>" . formatCC($item['price']) . "</div>";
            echo "  <p style='font-size: 0.9rem; opacity: 0.7;'>Collector Winner:</p>";
            echo "  <strong style='color: var(--color-ivory);'>" . htmlspecialchars($item['winner']) . "</strong>";
            echo "</div>";
        }

        echo "</div>";
    }

    // ==========================
    // MODULE: ACHIEVEMENTS
    // ==========================
    elseif ($page == "achievements") {
        echo "<h2>The Triumph Registry</h2>";
        echo "<div class='card-grid'>";

        foreach ($achievements as $achievement) {
            $statusBadge = $achievement['unlocked'] ? 'badge-unlocked' : 'badge-locked';
            $statusText = $achievement['unlocked'] ? 'Unlocked' : 'Locked';

            echo "<div class='kingdom-card'>";
            echo "  <div style='display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;'>";
            echo "      <h3>" . htmlspecialchars($achievement['name']) . "</h3>";
            echo "      <span class='badge {$statusBadge}'>{$statusText}</span>";
            echo "  </div>";
            echo "  <p style='color: rgba(245, 240, 232, 0.7); font-size: 0.95rem;'>" . htmlspecialchars($achievement['description']) . "</p>";
            echo "</div>";
        }

        echo "</div>";
    }

    // ==========================
    // MODULE: EVENTS
    // ==========================
    elseif ($page == "events") {
        echo "<h2>Festival Calendar</h2>";
        echo "<div class='card-grid'>";

        foreach ($events as $event) {
            echo "<div class='kingdom-card' style='border-left: 3px solid var(--color-gold-bright);'>";
            echo "  <h3>" . htmlspecialchars($event['title']) . "</h3>";
            echo "  <p style='color: rgba(245, 240, 232, 0.8); margin-bottom: 1rem;'>" . htmlspecialchars($event['description']) . "</p>";
            echo "  <div style='font-size: 0.85rem; font-family: var(--font-numeric); color: var(--color-gold-light);'>";
            echo "      <span style='opacity: 0.6;'>ENDS:</span> " . $event['end_date'];
            echo "  </div>";
            echo "</div>";
        }

        echo "</div>";
    }

    // ==========================
    // MODULE: HELP & FAQ
    // ==========================
    elseif ($page == "help") {
        echo "<h2>Help & FAQ</h2>";
        echo "<div style='max-width: 800px; margin: 0 auto;'>";

        foreach ($faq as $item) {
            echo "<details>";
            echo "  <summary>" . htmlspecialchars($item['question']) . "</summary>";
            echo "  <p>" . htmlspecialchars($item['answer']) . "</p>";
            echo "</details>";
        }

        echo "  <div class='kingdom-card' style='margin-top: 3rem; text-align: center; border: 1px dashed rgba(201, 168, 76, 0.3);'>";
        echo "      <h3 style='color: var(--color-gold);'>Butuh Bantuan Tambahan Kerajaan?</h3>";
        echo "      <p style='font-size: 0.95rem; margin-bottom: 0.5rem;'>Hubungi tim pendukung kami langsung melalui pos burung elektronik:</p>";
        echo "      <a href='mailto:support@emeraldkingdom.com' style='color: var(--color-gold-bright); font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;'>
                        <svg class='k-icon'><use href='#icon-mail'/></svg> support@emeraldkingdom.com
                    </a>";
        echo "  </div>";
        echo "</div>";
    }

    // ==========================
    // MODULE: 404 RUNTIME ERROR
    // ==========================
    else {
        http_response_code(404);
        echo "<div class='error-view'>";
        echo "  <div class='error-code'>404</div>";
        echo "  <h2>The Path is Lost</h2>";
        echo "  <p style='max-width: 500px; margin: 0 auto; opacity: 0.8;'>The path you seek lies beyond the borders of the known emerald kingdom.</p>";
        echo "  <a href='?page=home' class='cta-btn'>Return to Citadel</a>";
        echo "</div>";
    }

    ?>
    </main>

    <footer>
        <p><?= APP_NAME ?> &copy; <?= date('Y') ?> &bull; Premium Auction Architecture Ecosystem</p>
    </footer>
</div>

</body>
</html>