M01 implements home/HomePage and intro/Intro with shared reference shell components. M02 adds AboutPage, ProjectsPage/ProjectModal, ExperiencePage and ContactPage through PublicRoute. Shared ModelViewer preserves the original renderer with lifecycle cleanup; Modal uses the native dialog and restores focus.

Crafting, advancements and editor remain RoutePlaceholder until M03, M04 and M05 respectively. BaselinePage and VoxelCanvas retain the M00 standalone React-artifact example. Demo data and visitor inventory layout are separate; no editor authorization, remote save or publication is implied.

M03 implements skills/SkillsPage, SkillLoadout and WorkshopDialog with the unchanged crafting engine/data. Visitor progress is separate from actual skills. Only advancements and editor remain placeholders; M04 is next.
