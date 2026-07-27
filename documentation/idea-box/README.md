# Idea Box

Raw idea documents and conversation summaries land here before they are distilled into the main notebook.

Use this folder for:

- pasted markdown summaries from other chats
- rough game concepts that may still be messy
- implementation prompts that should be preserved as source context

After review, durable decisions should be copied into `../GAME_IDEAS_NOTEBOOK.md` or the relevant app README. Files here are allowed to remain rough.


# **Chem Games / Steam Context Document**

> **Corrections (added 2026-07-27).** Two factual notes before reading — the document below is a
> conversation transcript, not a verified technical assessment.
>
> 1. **There is no Vue in this project.** The repo is vanilla HTML/CSS/JS with **no `package.json`,
>    no bundler, and no build step** — ten self-contained games. This makes Electron packaging
>    *easier* than described below (Electron just loads static files), but it also means there is no
>    app shell yet — no title screen, save system, settings, or audio. **That shell, not the Electron
>    wrap, is the real work.** See `../PRODUCT_STRATEGY.md` §3.
> 2. **"Norman glacier"** is a garbled transcription of **"nomenclature."**
>
> Decisions taken from this document now live in **`../PRODUCT_STRATEGY.md`**, which is the
> north-star doc. This file is preserved as the raw source context.

## **Project Overview**

Dalia is developing a chemistry education game project currently referred to as **Chem Games**. One of the strongest existing prototypes is the chemistry nomenclature game, sometimes referred to informally as the “Norman glacier” project.

The project began around May 2026. By late July 2026, Dalia had a working prototype despite having barely worked on it during the preceding month.

Dalia described the progress with genuine excitement:

“In May, none of this even existed.”

“Today towards the end of July, I have a prototype that I actually barely touched in the past month.”

“And now we’re talking about a downloadable application on Steam? It’s exciting!”

The current game is primarily built around chemistry exercises and puzzles rather than a traditional narrative game structure.

The strongest prototype includes:

- an introductory screen explaining a particular technique for naming compounds;
- a mode where the player names a compound from its formula;
- a mode where the player writes the formula from the compound name;
- several progressive levels of chemistry nomenclature.

The planned or existing level progression includes:

1. Type I ionic compounds with fixed oxidation states, such as sodium and lithium compounds.
2. Ionic compounds involving metals with variable oxidation states and simple monatomic anions.
3. Compounds involving oxyanions.
4. Covalent compounds.
5. Acids.

The prototype is currently written using web technologies, particularly JavaScript and Vue.

---

## **How Steam Entered the Discussion**

Steam was suggested by Oleg during a conversation about possible monetization of Chem Games.

Before this conversation, Dalia had been conceptualizing the project primarily as an online educational platform or website.

Oleg suggested that the game could instead be distributed through Steam.

This suggestion changed the way Dalia imagined the project.

The central conceptual shift was:

- from an educational website containing chemistry exercises;
- to a downloadable, standalone chemistry puzzle game distributed through Steam.

Dalia had not previously considered Steam as a realistic platform for the project.

Her reaction was strongly positive. The Steam idea made the project feel more tangible, more game-like, and potentially more commercially viable.

The conversation was motivating beyond the personal interaction with Oleg. Dalia returned home thinking about how Chem Games could become a real downloadable product.

---

## **Dalia’s Initial Questions and Concerns**

Dalia had never developed a game for Steam before.

Her main technical question was essentially:

How does someone who currently develops in JavaScript and Vue turn that project into something that can be released on Steam?

She works primarily on a Mac.

She also has access to Windows through Parallels.

The underlying concerns included:

- whether Steam development requires learning Unity or another traditional game engine;
- whether the current JavaScript/Vue codebase could be reused;
- how a web-based project becomes a downloadable desktop application;
- how Windows builds could be created and tested while primarily working on a Mac;
- what Steam itself requires from developers.

---

## **Suggested Product Positioning**

One suggestion was to avoid thinking of Chem Games primarily as an educational website packaged into an executable.

Instead, the project could be positioned as an **indie chemistry puzzle game**.

The educational content would remain central, but the player-facing identity would emphasize:

- satisfying puzzle-solving;
- progression;
- visual polish;
- discovery;
- challenge;
- mastery;
- personality.

A useful framing proposed during the discussion was:

not an educator making a website, but an indie game developer making a chemistry game.

This does not require abandoning educational rigor. It changes how the product is experienced and presented.

The game could still teach chemistry accurately while feeling like a complete game rather than a digital worksheet.

---

## **Exercises Versus Game Structure**

Dalia noted that the current content is mostly made up of exercises and puzzles.

She considered whether the project would need a character or storyline in order to work as a Steam game.

The suggestion was that a large narrative storyline is not necessarily required.

Chem Games could work well as a polished puzzle collection with progression and personality.

A distinction was made between **story** and **personality**.

The game may not need:

- a complex plot;
- cinematic storytelling;
- extensive dialogue;
- a large fictional world.

It may benefit from:

- a recognizable visual identity;
- a mascot or guide;
- playful feedback;
- music and sound;
- level progression;
- achievements;
- unlockable content;
- satisfying transitions;
- a sense of momentum.

Possible personality elements discussed included:

- a robot assistant;
- a cat;
- a quirky chemistry guide;
- expressive animations;
- humorous responses to mistakes;
- celebratory responses to correct answers.

These were presented as optional ways to make the project feel memorable without requiring a major narrative-development effort.

---

## **Possible Game Structure**

A possible structure for the Steam version would be a sequence of chemistry puzzle modules.

The nomenclature game could serve as the first substantial release or as the foundation of a broader collection.

A possible progression could include:

- tutorials introducing each naming system;
- short practice rounds;
- increasing difficulty;
- mixed review levels;
- timed or untimed challenge modes;
- mastery tests;
- unlockable chemistry topics;
- achievements for accuracy, speed, or consistency.

The existing two-mode structure already supports a useful gameplay loop:

### **Mode 1: Name the Compound**

The player sees a chemical formula and enters or selects the correct compound name.

### **Mode 2: Write the Formula**

The player sees a compound name and constructs or enters the correct chemical formula.

The two modes test related but distinct skills and could be presented as separate paths, complementary missions, or alternating challenges.

The progressive chemistry categories provide a natural level structure.

---

## **Possible Broader Product Strategy**

One suggestion was to think of Chem Games as a series rather than requiring one game to teach all of chemistry.

For example, the first release might focus on foundational chemistry skills.

Possible releases or modules could include:

- Chem Games: Nomenclature;
- Chem Games: Foundations;
- Chem Games: Stoichiometry;
- Chem Games: Chemical Equations;
- Chem Games: Organic Chemistry;
- Chem Games: Acids and Bases;
- Chem Games: Electrochemistry.

This approach could allow the first product to remain small and polished.

It would also make it possible to reuse:

- visual assets;
- interface systems;
- user profiles;
- progression logic;
- question-generation systems;
- achievement structures;
- audio;
- branding.

An alternative would be one larger game with multiple unlockable chemistry “worlds” or modules.

No final decision was made between a single broad game and a series of focused games.

---

## **Suggested Technical Approach**

The main technical suggestion was to reuse the existing Vue/JavaScript application rather than rebuilding everything in Unity.

A possible architecture would be:

Existing Vue / JavaScript application  
→ wrapped in Electron  
→ built as a desktop application  
→ distributed through Steam

### **Electron**

Electron allows web applications built with HTML, CSS, JavaScript, and frameworks such as Vue to run as desktop applications.

Under this approach, Dalia could retain much of the current:

- Vue interface;
- JavaScript game logic;
- HTML;
- CSS;
- component structure;
- question-generation logic;
- educational content.

Electron would provide the desktop shell around the existing application.

The result could be built as a Windows application and potentially also as a macOS application.

This means Unity is not strictly required.

Unity or another game engine might become useful later if the project grows into something highly animated, physics-based, three-dimensional, or graphically complex. For the current puzzle-based structure, Vue plus Electron appears plausible.

---

## **Desktop Features That May Be Needed**

Turning the current prototype into a desktop game would involve more than simply wrapping the webpage.

Possible desktop-game features include:

- a proper title screen;
- start, continue, and new-game options;
- local save data;
- progress tracking;
- settings;
- audio controls;
- display or resolution options;
- keyboard and mouse navigation;
- pause and exit behavior;
- confirmation before deleting progress;
- smooth scene or screen transitions;
- loading states;
- offline functionality;
- persistent player profiles;
- achievement tracking;
- error handling;
- autosave;
- backup or recovery of progress.

The game would likely need to avoid relying on a remote server for essential gameplay unless online functionality is intentionally added.

A self-contained offline experience may be especially appropriate for an educational puzzle game.

---

## **Steam’s Role**

Steam itself does not dictate the programming language or engine.

A developer can distribute a game made with:

- Unity;
- Unreal;
- Godot;
- Electron;
- custom engines;
- other desktop frameworks.

Steam primarily functions as:

- a storefront;
- a distribution platform;
- an update system;
- a launcher;
- a payment platform;
- a review platform;
- a discovery platform;
- an optional achievements and cloud-save ecosystem.

The game must ultimately be packaged as a desktop application that Steam can install and launch.

---

## **Steamworks and Steam Direct**

Publishing on Steam involves creating a Steamworks developer account and submitting the product through Steam Direct.

A Steam Direct fee of approximately **$100 per product** was discussed.

The fee is generally paid when creating the product listing.

Steam provides developer tools through Steamworks.

Possible Steamworks features include:

- Steam achievements;
- Steam Cloud saves;
- leaderboards;
- statistics;
- controller support;
- localization tools;
- community features;
- store-page management;
- build distribution;
- beta branches;
- update deployment.

These features are optional.

A first release could use Steam primarily for distribution and sales without implementing every Steamworks feature.

---

## **Steam Build Uploads**

Steam uses a system called **SteamPipe** for uploading and distributing builds.

At a high level, the process involves:

- creating a Steamworks application entry;
- defining one or more depots;
- preparing the game files;
- configuring build scripts;
- uploading builds;
- assigning builds to branches;
- testing the build through Steam;
- eventually publishing it to customers.

Possible branches could include:

- internal testing;
- beta testing;
- public release.

The details of SteamPipe were not explored deeply in the original discussion, but it was identified as the system that would eventually be used to upload the desktop build.

---

## **Store Page and Release Presence**

A Steam release would require a store page.

Possible store-page materials include:

- game title;
- short description;
- detailed description;
- screenshots;
- capsule images;
- logo;
- trailer;
- system requirements;
- supported languages;
- release date or “Coming Soon” status;
- pricing;
- genre and feature tags.

A **Coming Soon** page could be published before the final game is complete.

Potential benefits include:

- accumulating wishlists;
- testing whether the concept attracts interest;
- establishing a public identity for the project;
- gathering reactions to screenshots and messaging;
- creating motivation and accountability;
- allowing players to follow development.

A polished prototype, clear visual identity, and several representative screenshots would likely be needed before such a page would be useful.

---

## **Mac and Windows Development Setup**

Dalia primarily works on a Mac.

She also has Windows through Parallels.

The suggested workflow was:

### **Primary Development**

Continue developing the Vue application on the Mac.

This is where Dalia is already comfortable and productive.

### **Windows Build and Testing**

Use Windows in Parallels to:

- run Windows builds;
- test installation;
- confirm file paths;
- verify saving and loading;
- check window behavior;
- test fonts;
- test audio;
- test keyboard input;
- run the game through Steam during development.

### **Version Control**

Use Git so that the project can be opened and built in both environments.

The repository could remain the common source of truth.

### **Physical Windows Testing**

Before a commercial release, testing on at least one physical Windows computer would be advisable.

A virtual machine can catch many issues, but it may not reproduce every graphics, performance, scaling, or hardware-specific problem.

Working on a Mac does not prevent a Steam release.

The likely primary commercial build would be for Windows because Windows represents the largest portion of the Steam audience.

A macOS build could be considered later or developed in parallel if practical.

---

## **Platform Scope**

A possible first release could target Windows only.

Reasons include:

- simpler testing;
- fewer platform-specific bugs;
- larger Steam audience;
- less packaging and support work;
- easier focus for a first release.

A macOS version could remain a later possibility.

The game could also potentially be distributed outside Steam in the future, because an Electron build is fundamentally a desktop application.

Possible additional channels might include:

- itch.io;
- direct downloads;
- educational licensing;
- school or university distribution;
- institutional sales.

No commitment was made to any of these.

---

## **Possible Monetization Models**

Steam introduced the possibility of selling the game as a standalone product.

Possible monetization approaches include:

### **One-Time Purchase**

The player buys the game once.

This is likely the simplest and most natural model for a small educational puzzle game.

### **Low-Cost Entry Game**

The first release could be inexpensive and narrowly focused, with later games or modules sold separately.

### **Free Demo and Paid Full Version**

A free demo could include:

- early nomenclature levels;
- limited daily play;
- one chemistry category;
- a small number of challenges.

The full version could unlock the complete game.

### **Series Model**

Each major chemistry topic could become a separate paid game.

### **Base Game Plus Expansions**

The main game could be sold once, with additional chemistry modules sold as downloadable content.

No final monetization decision was made.

The discussion mainly established that Steam makes direct consumer sales more plausible than Dalia had previously imagined.

---

## **Target Audience**

Potential users could include:

- high school chemistry students;
- university students taking introductory chemistry;
- pre-medical students;
- students preparing for entrance examinations;
- teachers seeking supplementary practice tools;
- adults who enjoy science puzzles;
- people refreshing chemistry knowledge;
- students who find ordinary worksheets boring.

The product would likely be strongest if it remains accessible to learners while still feeling satisfying to players who enjoy logic and progression.

---

## **Educational Strengths of the Existing Project**

The current project already has several strengths that translate well to a game:

- chemistry content is structured by difficulty;
- naming and formula-writing provide complementary modes;
- feedback can be immediate;
- content can be procedurally generated;
- questions can be repeated without being identical;
- concepts can be introduced gradually;
- mastery can be measured;
- errors can be diagnosed;
- the player can practice without classroom embarrassment;
- progression can be tied to actual understanding.

Dalia’s background as a chemistry educator and analytical chemist is a major project asset.

The content is not being created by someone merely adding scientific vocabulary to a generic game. The educational systems are being designed by someone who understands chemistry, misconceptions, nomenclature rules, and teaching.

---

## **Possible Differentiation**

Chem Games could distinguish itself from ordinary chemistry learning tools by combining:

- scientifically accurate content;
- strong progression;
- polished interaction;
- humor or personality;
- satisfying visual feedback;
- a cohesive artistic identity;
- offline play;
- replayability;
- genuine educational value.

The goal would not necessarily be to compete with large entertainment games.

It could instead occupy a less crowded space between:

- educational software;
- casual puzzle games;
- science games;
- study tools.

The game could appeal both to students who need practice and to players who simply like systems, patterns, and structured puzzles.

---

## **Scope Considerations**

A major implied suggestion was to avoid allowing the Steam idea to inflate the project into something impossibly large.

The first Steam-ready product does not need:

- every branch of chemistry;
- a huge storyline;
- multiplayer;
- elaborate animation;
- a massive world;
- voice acting;
- hundreds of custom illustrations;
- every Steamworks feature.

A small, complete, polished game would likely be more valuable than an enormous unfinished educational platform.

A possible first product could consist of:

- the nomenclature system;
- a strong tutorial;
- both existing game modes;
- polished progression;
- save data;
- sound and music;
- achievements;
- several hours of content;
- a clear ending or mastery state.

---

## **Possible Development Sequence**

The following were discussed as suggestions for possible next steps rather than fixed requirements.

### **Define the First Steam Product**

Possible questions include:

- Is the first product specifically a nomenclature game?
- Is it a broader “Chem Games: Foundations” release?
- How many chemistry categories belong in version 1?
- What constitutes completing the game?
- What experience should a player have after one hour?
- What experience should a player have after finishing?

### **Stabilize the Existing Prototype**

Possible work includes:

- fixing existing bugs;
- separating game logic from interface code;
- improving question generation;
- validating chemistry answers;
- ensuring difficulty progression is consistent;
- improving responsiveness and keyboard input;
- creating a clear save-data model.

### **Add a Desktop Shell**

A possible experiment would be to wrap the current Vue project in Electron and create a basic Windows executable.

This would test the central technical assumption:

Can the current web application become a desktop game without a rewrite?

### **Create a Vertical Slice**

A vertical slice would be a small section of the game that feels close to finished.

It might include:

- a title screen;
- one tutorial;
- several Type I ionic compound levels;
- one challenge mode;
- save and resume;
- sound;
- animations;
- progress display;
- a completion screen.

This could reveal whether the overall concept feels like a game.

### **Develop the Game’s Identity**

Possible areas include:

- title;
- logo;
- mascot or guide;
- typography;
- interface style;
- chemistry visual language;
- sound identity;
- tone of feedback;
- level-completion effects.

### **Test With Real Players**

Potential testers include:

- chemistry students;
- teachers;
- friends who enjoy puzzle games;
- people who do not already understand nomenclature;
- people with strong chemistry backgrounds.

Useful observations could include:

- where players become confused;
- whether instructions are clear;
- whether the game feels rewarding;
- whether difficulty increases appropriately;
- whether players want to continue;
- whether wrong-answer feedback teaches anything.

### **Investigate Steamworks**

Possible research areas include:

- Steam Direct registration;
- current submission requirements;
- required tax and payment information;
- store-page asset specifications;
- review timelines;
- content questionnaire requirements;
- pricing;
- regional pricing;
- SteamPipe;
- supported operating systems;
- achievement integration;
- demos;
- beta branches.

### **Build a Coming Soon Page**

This could become relevant once the game has:

- a stable title;
- a visual identity;
- screenshots that resemble the final product;
- a clear description;
- a realistic release scope.

### **Consider a Demo**

A demo could help:

- gather wishlists;
- test player interest;
- identify usability problems;
- generate feedback;
- demonstrate educational value;
- give teachers and students a low-risk way to try it.

---

## **Core Conceptual Shift**

The most important outcome of the Steam discussion was not a technical decision.

It was a change in Dalia’s perception of the project.

Before the conversation, Chem Games was largely imagined as an educational website or online platform.

After the conversation, Dalia began imagining it as:

- a downloadable application;
- a real commercial product;
- an indie puzzle game;
- something that could exist on Steam;
- something players might buy, install, complete, review, and recommend.

That reframing made the progress since May feel much more significant.

The project had moved from an early experiment to something that could potentially become a real published game.

Dalia’s excitement came partly from recognizing that the existing prototype may be closer to a viable product than she had realized.

---

## **Current Working Conclusion**

There is no final commitment yet to release Chem Games on Steam.

However, the idea appears technically plausible and strategically interesting.

The most plausible current route is:

- continue using Vue and JavaScript;
- package the application as a desktop game using Electron;
- develop and test primarily on Mac;
- build and test the Windows version through Parallels;
- eventually test on physical Windows hardware;
- release a narrow, polished chemistry puzzle game rather than waiting for a complete educational platform;
- use Steam for storefront, distribution, updates, and optional platform features.

The key open questions are product scope, game identity, polish, testing, and whether the nomenclature prototype should become the first standalone release or part of a broader foundational chemistry game.

Games to check out for ideas and engine: 
https://store.steampowered.com/app/619150/while_True_learn/
https://store.steampowered.com/app/1444480/Turing_Complete/
