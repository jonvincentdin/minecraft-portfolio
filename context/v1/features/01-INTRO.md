# F01 — Cinematic introduction

CSS landscape includes sun, near/far block mountains, ground plane, three floating blocks, particles, grain and letterbox bars. Center title and progress indicator; footer-like row contains Enter world.

States: loading → ready → exiting → entered. Replay resets to loading/ready according to assets already available. Use real asset loading promises; failed models may use thumbnails with a status notice. Enable Enter world only when the usable experience is ready.

Click once: disable the button, stage home beneath the overlay, freeze opening transforms, lift independent pieces in shuffled order, lift eight sky strips in shuffled order, reveal home, release inert controls and focus main. Ignore repeat entry while exiting. Cancel animations on teardown/replay. Reduced motion skips the spatial exit but still requires the click.

Acceptance: waiting 10 seconds at ready never enters automatically; entry takes approximately 1.32 seconds under normal motion; home is visible and focused after exit; replay works twice without ghost strips or duplicate callbacks.
