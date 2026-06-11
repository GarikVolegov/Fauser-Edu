import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import classesRouter from "./classes";
import subjectsRouter from "./subjects";
import gradesRouter from "./grades";
import attendanceRouter from "./attendance";
import assignmentsRouter from "./assignments";
import materialsRouter from "./materials";
import eventsRouter from "./events";
import announcementsRouter from "./announcements";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/classes", classesRouter);
router.use("/subjects", subjectsRouter);
router.use("/grades", gradesRouter);
router.use("/attendance", attendanceRouter);
router.use("/assignments", assignmentsRouter);
router.use("/materials", materialsRouter);
router.use("/events", eventsRouter);
router.use("/announcements", announcementsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
