M01 implements home/HomePage and intro/Intro with shared reference shell components. M02 adds AboutPage, ProjectsPage/ProjectModal, ExperiencePage and ContactPage through PublicRoute. Shared ModelViewer preserves the original renderer with lifecycle cleanup; Modal uses the native dialog and restores focus.

Crafting, advancements and editor remain RoutePlaceholder until M03, M04 and M05 respectively. BaselinePage and VoxelCanvas retain the M00 standalone React-artifact example. Demo data and visitor inventory layout are separate; no editor authorization, remote save or publication is implied.

M03 implements skills/SkillsPage, SkillLoadout and WorkshopDialog with the unchanged crafting engine/data. Visitor progress is separate from actual skills.

M04 implements advancements/AdvancementsPage on the unchanged tree-paths.js, and App mounts the unchanged motion.js section reveals and pixel burst. Only the editor remains a placeholder; M05 is next.
