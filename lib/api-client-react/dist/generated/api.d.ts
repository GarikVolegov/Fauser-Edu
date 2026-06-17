import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsSummary, Announcement, AnnouncementInput, AppNotification, Appointment, AppointmentInput, AppointmentStatusInput, Assignment, AssignmentInput, AssignmentUpdate, Attendance, AttendanceInput, AttendanceSummary, AttendanceUpdate, BehaviorNote, BehaviorNoteInput, Class, ClassInput, ClassMessage, ClassUpdate, CompetencyInput, CompetencyItem, CreateClassMessageBody, DashboardSummary, DiaryEntry, DiaryEntryInput, EmailAccountConfig, EmailAccountCredentials, EmailComposeRequest, EmailHeader, EmailMessage, Event, EventInput, EventUpdate, FieldTrip, FieldTripInput, FieldTripParticipant, FieldTripStatusInput, ForumPost, ForumPostInput, ForumThread, ForumThreadInput, GetAttendanceSummaryParams, GetEmailInboxParams, GetGradesSummaryParams, Grade, GradeInput, GradeSummary, GradeUpdate, HealthStatus, Justification, JustificationInput, JustificationReviewInput, ListAppointmentsParams, ListAssignmentsParams, ListAttendanceParams, ListBehaviorNotesParams, ListCompetenciesParams, ListEventsParams, ListForumThreadsParams, ListGradesParams, ListGroupMessagesParams, ListJustificationsParams, ListMaterialsParams, ListQuizzesParams, ListRoomBookingsParams, ListScheduleParams, ListStudentCompetenciesParams, ListSubjectsParams, ListTutoringPostsParams, ListUsersParams, MarkAllNotificationsRead200, Material, MaterialInput, ParticipantStatusInput, PollDetail, PollInput, PollStatusInput, PollVoteInput, QuizDetail, QuizInput, QuizQuestionDetail, QuizQuestionInput, QuizResult, QuizStatusInput, QuizSubmitInput, QuizSummary, Room, RoomBooking, RoomBookingInput, RoomInput, ScheduleEntry, ScheduleEntryInput, SendEmail200, StudentCompetencyInput, StudentCompetencyItem, Subject, SubjectInput, TutoringPost, TutoringPostInput, TutoringPostStatusInput, UpcomingItems, User, UserUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user profile
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/users/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
/**
 * @summary Get current user profile
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMeUrl: () => string;
/**
 * @summary Update current user profile
 */
export declare const updateMe: (userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateMeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateMeMutationResult = NonNullable<Awaited<ReturnType<typeof updateMe>>>;
export type UpdateMeMutationBody = BodyType<UserUpdate>;
export type UpdateMeMutationError = ErrorType<unknown>;
/**
* @summary Update current user profile
*/
export declare const useUpdateMe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
/**
 * @summary List all users
 */
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListClassesUrl: () => string;
/**
 * @summary List all classes
 */
export declare const listClasses: (options?: RequestInit) => Promise<Class[]>;
export declare const getListClassesQueryKey: () => readonly ["/api/classes"];
export declare const getListClassesQueryOptions: <TData = Awaited<ReturnType<typeof listClasses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListClassesQueryResult = NonNullable<Awaited<ReturnType<typeof listClasses>>>;
export type ListClassesQueryError = ErrorType<unknown>;
/**
 * @summary List all classes
 */
export declare function useListClasses<TData = Awaited<ReturnType<typeof listClasses>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listClasses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateClassUrl: () => string;
/**
 * @summary Create a class
 */
export declare const createClass: (classInput: ClassInput, options?: RequestInit) => Promise<Class>;
export declare const getCreateClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
        data: BodyType<ClassInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
    data: BodyType<ClassInput>;
}, TContext>;
export type CreateClassMutationResult = NonNullable<Awaited<ReturnType<typeof createClass>>>;
export type CreateClassMutationBody = BodyType<ClassInput>;
export type CreateClassMutationError = ErrorType<unknown>;
/**
* @summary Create a class
*/
export declare const useCreateClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClass>>, TError, {
        data: BodyType<ClassInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClass>>, TError, {
    data: BodyType<ClassInput>;
}, TContext>;
export declare const getGetClassUrl: (id: number) => string;
/**
 * @summary Get a class
 */
export declare const getClass: (id: number, options?: RequestInit) => Promise<Class>;
export declare const getGetClassQueryKey: (id: number) => readonly [`/api/classes/${number}`];
export declare const getGetClassQueryOptions: <TData = Awaited<ReturnType<typeof getClass>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClass>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getClass>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetClassQueryResult = NonNullable<Awaited<ReturnType<typeof getClass>>>;
export type GetClassQueryError = ErrorType<unknown>;
/**
 * @summary Get a class
 */
export declare function useGetClass<TData = Awaited<ReturnType<typeof getClass>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClass>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateClassUrl: (id: number) => string;
/**
 * @summary Update a class
 */
export declare const updateClass: (id: number, classUpdate: ClassUpdate, options?: RequestInit) => Promise<Class>;
export declare const getUpdateClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
        id: number;
        data: BodyType<ClassUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
    id: number;
    data: BodyType<ClassUpdate>;
}, TContext>;
export type UpdateClassMutationResult = NonNullable<Awaited<ReturnType<typeof updateClass>>>;
export type UpdateClassMutationBody = BodyType<ClassUpdate>;
export type UpdateClassMutationError = ErrorType<unknown>;
/**
* @summary Update a class
*/
export declare const useUpdateClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateClass>>, TError, {
        id: number;
        data: BodyType<ClassUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateClass>>, TError, {
    id: number;
    data: BodyType<ClassUpdate>;
}, TContext>;
export declare const getDeleteClassUrl: (id: number) => string;
/**
 * @summary Delete a class
 */
export declare const deleteClass: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteClassMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
    id: number;
}, TContext>;
export type DeleteClassMutationResult = NonNullable<Awaited<ReturnType<typeof deleteClass>>>;
export type DeleteClassMutationError = ErrorType<unknown>;
/**
* @summary Delete a class
*/
export declare const useDeleteClass: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteClass>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteClass>>, TError, {
    id: number;
}, TContext>;
export declare const getListSubjectsUrl: (params?: ListSubjectsParams) => string;
/**
 * @summary List all subjects
 */
export declare const listSubjects: (params?: ListSubjectsParams, options?: RequestInit) => Promise<Subject[]>;
export declare const getListSubjectsQueryKey: (params?: ListSubjectsParams) => readonly ["/api/subjects", ...ListSubjectsParams[]];
export declare const getListSubjectsQueryOptions: <TData = Awaited<ReturnType<typeof listSubjects>>, TError = ErrorType<unknown>>(params?: ListSubjectsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSubjectsQueryResult = NonNullable<Awaited<ReturnType<typeof listSubjects>>>;
export type ListSubjectsQueryError = ErrorType<unknown>;
/**
 * @summary List all subjects
 */
export declare function useListSubjects<TData = Awaited<ReturnType<typeof listSubjects>>, TError = ErrorType<unknown>>(params?: ListSubjectsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSubjects>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateSubjectUrl: () => string;
/**
 * @summary Create a subject
 */
export declare const createSubject: (subjectInput: SubjectInput, options?: RequestInit) => Promise<Subject>;
export declare const getCreateSubjectMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, {
        data: BodyType<SubjectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, {
    data: BodyType<SubjectInput>;
}, TContext>;
export type CreateSubjectMutationResult = NonNullable<Awaited<ReturnType<typeof createSubject>>>;
export type CreateSubjectMutationBody = BodyType<SubjectInput>;
export type CreateSubjectMutationError = ErrorType<unknown>;
/**
* @summary Create a subject
*/
export declare const useCreateSubject: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSubject>>, TError, {
        data: BodyType<SubjectInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSubject>>, TError, {
    data: BodyType<SubjectInput>;
}, TContext>;
export declare const getListGradesUrl: (params?: ListGradesParams) => string;
/**
 * @summary List grades
 */
export declare const listGrades: (params?: ListGradesParams, options?: RequestInit) => Promise<Grade[]>;
export declare const getListGradesQueryKey: (params?: ListGradesParams) => readonly ["/api/grades", ...ListGradesParams[]];
export declare const getListGradesQueryOptions: <TData = Awaited<ReturnType<typeof listGrades>>, TError = ErrorType<unknown>>(params?: ListGradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGrades>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGradesQueryResult = NonNullable<Awaited<ReturnType<typeof listGrades>>>;
export type ListGradesQueryError = ErrorType<unknown>;
/**
 * @summary List grades
 */
export declare function useListGrades<TData = Awaited<ReturnType<typeof listGrades>>, TError = ErrorType<unknown>>(params?: ListGradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGradeUrl: () => string;
/**
 * @summary Create a grade
 */
export declare const createGrade: (gradeInput: GradeInput, options?: RequestInit) => Promise<Grade>;
export declare const getCreateGradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGrade>>, TError, {
        data: BodyType<GradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGrade>>, TError, {
    data: BodyType<GradeInput>;
}, TContext>;
export type CreateGradeMutationResult = NonNullable<Awaited<ReturnType<typeof createGrade>>>;
export type CreateGradeMutationBody = BodyType<GradeInput>;
export type CreateGradeMutationError = ErrorType<unknown>;
/**
* @summary Create a grade
*/
export declare const useCreateGrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGrade>>, TError, {
        data: BodyType<GradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGrade>>, TError, {
    data: BodyType<GradeInput>;
}, TContext>;
export declare const getUpdateGradeUrl: (id: number) => string;
/**
 * @summary Update a grade
 */
export declare const updateGrade: (id: number, gradeUpdate: GradeUpdate, options?: RequestInit) => Promise<Grade>;
export declare const getUpdateGradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGrade>>, TError, {
        id: number;
        data: BodyType<GradeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateGrade>>, TError, {
    id: number;
    data: BodyType<GradeUpdate>;
}, TContext>;
export type UpdateGradeMutationResult = NonNullable<Awaited<ReturnType<typeof updateGrade>>>;
export type UpdateGradeMutationBody = BodyType<GradeUpdate>;
export type UpdateGradeMutationError = ErrorType<unknown>;
/**
* @summary Update a grade
*/
export declare const useUpdateGrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGrade>>, TError, {
        id: number;
        data: BodyType<GradeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateGrade>>, TError, {
    id: number;
    data: BodyType<GradeUpdate>;
}, TContext>;
export declare const getDeleteGradeUrl: (id: number) => string;
/**
 * @summary Delete a grade
 */
export declare const deleteGrade: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteGradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGrade>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGrade>>, TError, {
    id: number;
}, TContext>;
export type DeleteGradeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGrade>>>;
export type DeleteGradeMutationError = ErrorType<unknown>;
/**
* @summary Delete a grade
*/
export declare const useDeleteGrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGrade>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGrade>>, TError, {
    id: number;
}, TContext>;
export declare const getGetGradesSummaryUrl: (params?: GetGradesSummaryParams) => string;
/**
 * @summary Get grades summary by subject
 */
export declare const getGradesSummary: (params?: GetGradesSummaryParams, options?: RequestInit) => Promise<GradeSummary[]>;
export declare const getGetGradesSummaryQueryKey: (params?: GetGradesSummaryParams) => readonly ["/api/grades/summary", ...GetGradesSummaryParams[]];
export declare const getGetGradesSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getGradesSummary>>, TError = ErrorType<unknown>>(params?: GetGradesSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGradesSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGradesSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGradesSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getGradesSummary>>>;
export type GetGradesSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get grades summary by subject
 */
export declare function useGetGradesSummary<TData = Awaited<ReturnType<typeof getGradesSummary>>, TError = ErrorType<unknown>>(params?: GetGradesSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGradesSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAttendanceUrl: (params?: ListAttendanceParams) => string;
/**
 * @summary List attendance records
 */
export declare const listAttendance: (params?: ListAttendanceParams, options?: RequestInit) => Promise<Attendance[]>;
export declare const getListAttendanceQueryKey: (params?: ListAttendanceParams) => readonly ["/api/attendance", ...ListAttendanceParams[]];
export declare const getListAttendanceQueryOptions: <TData = Awaited<ReturnType<typeof listAttendance>>, TError = ErrorType<unknown>>(params?: ListAttendanceParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttendance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAttendance>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAttendanceQueryResult = NonNullable<Awaited<ReturnType<typeof listAttendance>>>;
export type ListAttendanceQueryError = ErrorType<unknown>;
/**
 * @summary List attendance records
 */
export declare function useListAttendance<TData = Awaited<ReturnType<typeof listAttendance>>, TError = ErrorType<unknown>>(params?: ListAttendanceParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttendance>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAttendanceUrl: () => string;
/**
 * @summary Record attendance
 */
export declare const createAttendance: (attendanceInput: AttendanceInput, options?: RequestInit) => Promise<Attendance>;
export declare const getCreateAttendanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAttendance>>, TError, {
        data: BodyType<AttendanceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAttendance>>, TError, {
    data: BodyType<AttendanceInput>;
}, TContext>;
export type CreateAttendanceMutationResult = NonNullable<Awaited<ReturnType<typeof createAttendance>>>;
export type CreateAttendanceMutationBody = BodyType<AttendanceInput>;
export type CreateAttendanceMutationError = ErrorType<unknown>;
/**
* @summary Record attendance
*/
export declare const useCreateAttendance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAttendance>>, TError, {
        data: BodyType<AttendanceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAttendance>>, TError, {
    data: BodyType<AttendanceInput>;
}, TContext>;
export declare const getUpdateAttendanceUrl: (id: number) => string;
/**
 * @summary Update attendance
 */
export declare const updateAttendance: (id: number, attendanceUpdate: AttendanceUpdate, options?: RequestInit) => Promise<Attendance>;
export declare const getUpdateAttendanceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAttendance>>, TError, {
        id: number;
        data: BodyType<AttendanceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAttendance>>, TError, {
    id: number;
    data: BodyType<AttendanceUpdate>;
}, TContext>;
export type UpdateAttendanceMutationResult = NonNullable<Awaited<ReturnType<typeof updateAttendance>>>;
export type UpdateAttendanceMutationBody = BodyType<AttendanceUpdate>;
export type UpdateAttendanceMutationError = ErrorType<unknown>;
/**
* @summary Update attendance
*/
export declare const useUpdateAttendance: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAttendance>>, TError, {
        id: number;
        data: BodyType<AttendanceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAttendance>>, TError, {
    id: number;
    data: BodyType<AttendanceUpdate>;
}, TContext>;
export declare const getGetAttendanceSummaryUrl: (params?: GetAttendanceSummaryParams) => string;
/**
 * @summary Get attendance summary
 */
export declare const getAttendanceSummary: (params?: GetAttendanceSummaryParams, options?: RequestInit) => Promise<AttendanceSummary>;
export declare const getGetAttendanceSummaryQueryKey: (params?: GetAttendanceSummaryParams) => readonly ["/api/attendance/summary", ...GetAttendanceSummaryParams[]];
export declare const getGetAttendanceSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getAttendanceSummary>>, TError = ErrorType<unknown>>(params?: GetAttendanceSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttendanceSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAttendanceSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAttendanceSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getAttendanceSummary>>>;
export type GetAttendanceSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get attendance summary
 */
export declare function useGetAttendanceSummary<TData = Awaited<ReturnType<typeof getAttendanceSummary>>, TError = ErrorType<unknown>>(params?: GetAttendanceSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAttendanceSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAssignmentsUrl: (params?: ListAssignmentsParams) => string;
/**
 * @summary List assignments
 */
export declare const listAssignments: (params?: ListAssignmentsParams, options?: RequestInit) => Promise<Assignment[]>;
export declare const getListAssignmentsQueryKey: (params?: ListAssignmentsParams) => readonly ["/api/assignments", ...ListAssignmentsParams[]];
export declare const getListAssignmentsQueryOptions: <TData = Awaited<ReturnType<typeof listAssignments>>, TError = ErrorType<unknown>>(params?: ListAssignmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssignments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAssignments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAssignmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listAssignments>>>;
export type ListAssignmentsQueryError = ErrorType<unknown>;
/**
 * @summary List assignments
 */
export declare function useListAssignments<TData = Awaited<ReturnType<typeof listAssignments>>, TError = ErrorType<unknown>>(params?: ListAssignmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssignments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAssignmentUrl: () => string;
/**
 * @summary Create an assignment
 */
export declare const createAssignment: (assignmentInput: AssignmentInput, options?: RequestInit) => Promise<Assignment>;
export declare const getCreateAssignmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssignment>>, TError, {
        data: BodyType<AssignmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAssignment>>, TError, {
    data: BodyType<AssignmentInput>;
}, TContext>;
export type CreateAssignmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAssignment>>>;
export type CreateAssignmentMutationBody = BodyType<AssignmentInput>;
export type CreateAssignmentMutationError = ErrorType<unknown>;
/**
* @summary Create an assignment
*/
export declare const useCreateAssignment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssignment>>, TError, {
        data: BodyType<AssignmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAssignment>>, TError, {
    data: BodyType<AssignmentInput>;
}, TContext>;
export declare const getGetAssignmentUrl: (id: number) => string;
/**
 * @summary Get an assignment
 */
export declare const getAssignment: (id: number, options?: RequestInit) => Promise<Assignment>;
export declare const getGetAssignmentQueryKey: (id: number) => readonly [`/api/assignments/${number}`];
export declare const getGetAssignmentQueryOptions: <TData = Awaited<ReturnType<typeof getAssignment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssignment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAssignment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAssignmentQueryResult = NonNullable<Awaited<ReturnType<typeof getAssignment>>>;
export type GetAssignmentQueryError = ErrorType<unknown>;
/**
 * @summary Get an assignment
 */
export declare function useGetAssignment<TData = Awaited<ReturnType<typeof getAssignment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssignment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAssignmentUrl: (id: number) => string;
/**
 * @summary Update an assignment
 */
export declare const updateAssignment: (id: number, assignmentUpdate: AssignmentUpdate, options?: RequestInit) => Promise<Assignment>;
export declare const getUpdateAssignmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssignment>>, TError, {
        id: number;
        data: BodyType<AssignmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAssignment>>, TError, {
    id: number;
    data: BodyType<AssignmentUpdate>;
}, TContext>;
export type UpdateAssignmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAssignment>>>;
export type UpdateAssignmentMutationBody = BodyType<AssignmentUpdate>;
export type UpdateAssignmentMutationError = ErrorType<unknown>;
/**
* @summary Update an assignment
*/
export declare const useUpdateAssignment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssignment>>, TError, {
        id: number;
        data: BodyType<AssignmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAssignment>>, TError, {
    id: number;
    data: BodyType<AssignmentUpdate>;
}, TContext>;
export declare const getDeleteAssignmentUrl: (id: number) => string;
/**
 * @summary Delete an assignment
 */
export declare const deleteAssignment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAssignmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAssignment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAssignment>>, TError, {
    id: number;
}, TContext>;
export type DeleteAssignmentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAssignment>>>;
export type DeleteAssignmentMutationError = ErrorType<unknown>;
/**
* @summary Delete an assignment
*/
export declare const useDeleteAssignment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAssignment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAssignment>>, TError, {
    id: number;
}, TContext>;
export declare const getListMaterialsUrl: (params?: ListMaterialsParams) => string;
/**
 * @summary List study materials
 */
export declare const listMaterials: (params?: ListMaterialsParams, options?: RequestInit) => Promise<Material[]>;
export declare const getListMaterialsQueryKey: (params?: ListMaterialsParams) => readonly ["/api/materials", ...ListMaterialsParams[]];
export declare const getListMaterialsQueryOptions: <TData = Awaited<ReturnType<typeof listMaterials>>, TError = ErrorType<unknown>>(params?: ListMaterialsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMaterials>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMaterials>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMaterialsQueryResult = NonNullable<Awaited<ReturnType<typeof listMaterials>>>;
export type ListMaterialsQueryError = ErrorType<unknown>;
/**
 * @summary List study materials
 */
export declare function useListMaterials<TData = Awaited<ReturnType<typeof listMaterials>>, TError = ErrorType<unknown>>(params?: ListMaterialsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMaterials>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMaterialUrl: () => string;
/**
 * @summary Upload a material
 */
export declare const createMaterial: (materialInput: MaterialInput, options?: RequestInit) => Promise<Material>;
export declare const getCreateMaterialMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMaterial>>, TError, {
        data: BodyType<MaterialInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMaterial>>, TError, {
    data: BodyType<MaterialInput>;
}, TContext>;
export type CreateMaterialMutationResult = NonNullable<Awaited<ReturnType<typeof createMaterial>>>;
export type CreateMaterialMutationBody = BodyType<MaterialInput>;
export type CreateMaterialMutationError = ErrorType<unknown>;
/**
* @summary Upload a material
*/
export declare const useCreateMaterial: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMaterial>>, TError, {
        data: BodyType<MaterialInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMaterial>>, TError, {
    data: BodyType<MaterialInput>;
}, TContext>;
export declare const getDeleteMaterialUrl: (id: number) => string;
/**
 * @summary Delete a material
 */
export declare const deleteMaterial: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMaterialMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMaterial>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMaterial>>, TError, {
    id: number;
}, TContext>;
export type DeleteMaterialMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMaterial>>>;
export type DeleteMaterialMutationError = ErrorType<unknown>;
/**
* @summary Delete a material
*/
export declare const useDeleteMaterial: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMaterial>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMaterial>>, TError, {
    id: number;
}, TContext>;
export declare const getListEventsUrl: (params?: ListEventsParams) => string;
/**
 * @summary List calendar events
 */
export declare const listEvents: (params?: ListEventsParams, options?: RequestInit) => Promise<Event[]>;
export declare const getListEventsQueryKey: (params?: ListEventsParams) => readonly ["/api/events", ...ListEventsParams[]];
export declare const getListEventsQueryOptions: <TData = Awaited<ReturnType<typeof listEvents>>, TError = ErrorType<unknown>>(params?: ListEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listEvents>>>;
export type ListEventsQueryError = ErrorType<unknown>;
/**
 * @summary List calendar events
 */
export declare function useListEvents<TData = Awaited<ReturnType<typeof listEvents>>, TError = ErrorType<unknown>>(params?: ListEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEventUrl: () => string;
/**
 * @summary Create a calendar event
 */
export declare const createEvent: (eventInput: EventInput, options?: RequestInit) => Promise<Event>;
export declare const getCreateEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, {
        data: BodyType<EventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, {
    data: BodyType<EventInput>;
}, TContext>;
export type CreateEventMutationResult = NonNullable<Awaited<ReturnType<typeof createEvent>>>;
export type CreateEventMutationBody = BodyType<EventInput>;
export type CreateEventMutationError = ErrorType<unknown>;
/**
* @summary Create a calendar event
*/
export declare const useCreateEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEvent>>, TError, {
        data: BodyType<EventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEvent>>, TError, {
    data: BodyType<EventInput>;
}, TContext>;
export declare const getUpdateEventUrl: (id: number) => string;
/**
 * @summary Update an event
 */
export declare const updateEvent: (id: number, eventUpdate: EventUpdate, options?: RequestInit) => Promise<Event>;
export declare const getUpdateEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, {
        id: number;
        data: BodyType<EventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, {
    id: number;
    data: BodyType<EventUpdate>;
}, TContext>;
export type UpdateEventMutationResult = NonNullable<Awaited<ReturnType<typeof updateEvent>>>;
export type UpdateEventMutationBody = BodyType<EventUpdate>;
export type UpdateEventMutationError = ErrorType<unknown>;
/**
* @summary Update an event
*/
export declare const useUpdateEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEvent>>, TError, {
        id: number;
        data: BodyType<EventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEvent>>, TError, {
    id: number;
    data: BodyType<EventUpdate>;
}, TContext>;
export declare const getDeleteEventUrl: (id: number) => string;
/**
 * @summary Delete an event
 */
export declare const deleteEvent: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, {
    id: number;
}, TContext>;
export type DeleteEventMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEvent>>>;
export type DeleteEventMutationError = ErrorType<unknown>;
/**
* @summary Delete an event
*/
export declare const useDeleteEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEvent>>, TError, {
    id: number;
}, TContext>;
export declare const getListAnnouncementsUrl: () => string;
/**
 * @summary List school announcements
 */
export declare const listAnnouncements: (options?: RequestInit) => Promise<Announcement[]>;
export declare const getListAnnouncementsQueryKey: () => readonly ["/api/announcements"];
export declare const getListAnnouncementsQueryOptions: <TData = Awaited<ReturnType<typeof listAnnouncements>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnnouncements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAnnouncements>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAnnouncementsQueryResult = NonNullable<Awaited<ReturnType<typeof listAnnouncements>>>;
export type ListAnnouncementsQueryError = ErrorType<unknown>;
/**
 * @summary List school announcements
 */
export declare function useListAnnouncements<TData = Awaited<ReturnType<typeof listAnnouncements>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnnouncements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAnnouncementUrl: () => string;
/**
 * @summary Create an announcement
 */
export declare const createAnnouncement: (announcementInput: AnnouncementInput, options?: RequestInit) => Promise<Announcement>;
export declare const getCreateAnnouncementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
        data: BodyType<AnnouncementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
    data: BodyType<AnnouncementInput>;
}, TContext>;
export type CreateAnnouncementMutationResult = NonNullable<Awaited<ReturnType<typeof createAnnouncement>>>;
export type CreateAnnouncementMutationBody = BodyType<AnnouncementInput>;
export type CreateAnnouncementMutationError = ErrorType<unknown>;
/**
* @summary Create an announcement
*/
export declare const useCreateAnnouncement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
        data: BodyType<AnnouncementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
    data: BodyType<AnnouncementInput>;
}, TContext>;
export declare const getGetAnnouncementUrl: (id: number) => string;
/**
 * @summary Get an announcement
 */
export declare const getAnnouncement: (id: number, options?: RequestInit) => Promise<Announcement>;
export declare const getGetAnnouncementQueryKey: (id: number) => readonly [`/api/announcements/${number}`];
export declare const getGetAnnouncementQueryOptions: <TData = Awaited<ReturnType<typeof getAnnouncement>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncement>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnnouncement>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnnouncementQueryResult = NonNullable<Awaited<ReturnType<typeof getAnnouncement>>>;
export type GetAnnouncementQueryError = ErrorType<unknown>;
/**
 * @summary Get an announcement
 */
export declare function useGetAnnouncement<TData = Awaited<ReturnType<typeof getAnnouncement>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncement>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardSummaryUrl: () => string;
/**
 * @summary Get dashboard summary for current user
 */
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary for current user
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUpcomingItemsUrl: () => string;
/**
 * @summary Get upcoming assignments and events
 */
export declare const getUpcomingItems: (options?: RequestInit) => Promise<UpcomingItems>;
export declare const getGetUpcomingItemsQueryKey: () => readonly ["/api/dashboard/upcoming"];
export declare const getGetUpcomingItemsQueryOptions: <TData = Awaited<ReturnType<typeof getUpcomingItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpcomingItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUpcomingItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUpcomingItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getUpcomingItems>>>;
export type GetUpcomingItemsQueryError = ErrorType<unknown>;
/**
 * @summary Get upcoming assignments and events
 */
export declare function useGetUpcomingItems<TData = Awaited<ReturnType<typeof getUpcomingItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpcomingItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListQuizzesUrl: (params?: ListQuizzesParams) => string;
/**
 * @summary List quizzes
 */
export declare const listQuizzes: (params?: ListQuizzesParams, options?: RequestInit) => Promise<QuizSummary[]>;
export declare const getListQuizzesQueryKey: (params?: ListQuizzesParams) => readonly ["/api/quizzes", ...ListQuizzesParams[]];
export declare const getListQuizzesQueryOptions: <TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(params?: ListQuizzesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuizzesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuizzes>>>;
export type ListQuizzesQueryError = ErrorType<unknown>;
/**
 * @summary List quizzes
 */
export declare function useListQuizzes<TData = Awaited<ReturnType<typeof listQuizzes>>, TError = ErrorType<unknown>>(params?: ListQuizzesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizzes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateQuizUrl: () => string;
/**
 * @summary Create a quiz
 */
export declare const createQuiz: (quizInput: QuizInput, options?: RequestInit) => Promise<QuizSummary>;
export declare const getCreateQuizMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
        data: BodyType<QuizInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
    data: BodyType<QuizInput>;
}, TContext>;
export type CreateQuizMutationResult = NonNullable<Awaited<ReturnType<typeof createQuiz>>>;
export type CreateQuizMutationBody = BodyType<QuizInput>;
export type CreateQuizMutationError = ErrorType<unknown>;
/**
* @summary Create a quiz
*/
export declare const useCreateQuiz: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuiz>>, TError, {
        data: BodyType<QuizInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createQuiz>>, TError, {
    data: BodyType<QuizInput>;
}, TContext>;
export declare const getGetQuizUrl: (id: number) => string;
/**
 * @summary Get quiz detail with questions
 */
export declare const getQuiz: (id: number, options?: RequestInit) => Promise<QuizDetail>;
export declare const getGetQuizQueryKey: (id: number) => readonly [`/api/quizzes/${number}`];
export declare const getGetQuizQueryOptions: <TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuizQueryResult = NonNullable<Awaited<ReturnType<typeof getQuiz>>>;
export type GetQuizQueryError = ErrorType<unknown>;
/**
 * @summary Get quiz detail with questions
 */
export declare function useGetQuiz<TData = Awaited<ReturnType<typeof getQuiz>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuiz>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateQuizStatusUrl: (id: number) => string;
/**
 * @summary Update quiz status
 */
export declare const updateQuizStatus: (id: number, quizStatusInput: QuizStatusInput, options?: RequestInit) => Promise<QuizSummary>;
export declare const getUpdateQuizStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuizStatus>>, TError, {
        id: number;
        data: BodyType<QuizStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuizStatus>>, TError, {
    id: number;
    data: BodyType<QuizStatusInput>;
}, TContext>;
export type UpdateQuizStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuizStatus>>>;
export type UpdateQuizStatusMutationBody = BodyType<QuizStatusInput>;
export type UpdateQuizStatusMutationError = ErrorType<unknown>;
/**
* @summary Update quiz status
*/
export declare const useUpdateQuizStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuizStatus>>, TError, {
        id: number;
        data: BodyType<QuizStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuizStatus>>, TError, {
    id: number;
    data: BodyType<QuizStatusInput>;
}, TContext>;
export declare const getAddQuizQuestionUrl: (id: number) => string;
/**
 * @summary Add a question to a quiz
 */
export declare const addQuizQuestion: (id: number, quizQuestionInput: QuizQuestionInput, options?: RequestInit) => Promise<QuizQuestionDetail>;
export declare const getAddQuizQuestionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addQuizQuestion>>, TError, {
        id: number;
        data: BodyType<QuizQuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addQuizQuestion>>, TError, {
    id: number;
    data: BodyType<QuizQuestionInput>;
}, TContext>;
export type AddQuizQuestionMutationResult = NonNullable<Awaited<ReturnType<typeof addQuizQuestion>>>;
export type AddQuizQuestionMutationBody = BodyType<QuizQuestionInput>;
export type AddQuizQuestionMutationError = ErrorType<unknown>;
/**
* @summary Add a question to a quiz
*/
export declare const useAddQuizQuestion: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addQuizQuestion>>, TError, {
        id: number;
        data: BodyType<QuizQuestionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addQuizQuestion>>, TError, {
    id: number;
    data: BodyType<QuizQuestionInput>;
}, TContext>;
export declare const getSubmitQuizUrl: (id: number) => string;
/**
 * @summary Submit quiz answers
 */
export declare const submitQuiz: (id: number, quizSubmitInput: QuizSubmitInput, options?: RequestInit) => Promise<QuizResult>;
export declare const getSubmitQuizMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitQuiz>>, TError, {
        id: number;
        data: BodyType<QuizSubmitInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitQuiz>>, TError, {
    id: number;
    data: BodyType<QuizSubmitInput>;
}, TContext>;
export type SubmitQuizMutationResult = NonNullable<Awaited<ReturnType<typeof submitQuiz>>>;
export type SubmitQuizMutationBody = BodyType<QuizSubmitInput>;
export type SubmitQuizMutationError = ErrorType<unknown>;
/**
* @summary Submit quiz answers
*/
export declare const useSubmitQuiz: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitQuiz>>, TError, {
        id: number;
        data: BodyType<QuizSubmitInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitQuiz>>, TError, {
    id: number;
    data: BodyType<QuizSubmitInput>;
}, TContext>;
export declare const getListQuizResponsesUrl: (id: number) => string;
/**
 * @summary List responses for a quiz
 */
export declare const listQuizResponses: (id: number, options?: RequestInit) => Promise<QuizResult[]>;
export declare const getListQuizResponsesQueryKey: (id: number) => readonly [`/api/quizzes/${number}/responses`];
export declare const getListQuizResponsesQueryOptions: <TData = Awaited<ReturnType<typeof listQuizResponses>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizResponses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuizResponses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuizResponsesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuizResponses>>>;
export type ListQuizResponsesQueryError = ErrorType<unknown>;
/**
 * @summary List responses for a quiz
 */
export declare function useListQuizResponses<TData = Awaited<ReturnType<typeof listQuizResponses>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuizResponses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListDiaryEntriesUrl: () => string;
/**
 * @summary List diary entries for current user
 */
export declare const listDiaryEntries: (options?: RequestInit) => Promise<DiaryEntry[]>;
export declare const getListDiaryEntriesQueryKey: () => readonly ["/api/diary"];
export declare const getListDiaryEntriesQueryOptions: <TData = Awaited<ReturnType<typeof listDiaryEntries>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDiaryEntries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDiaryEntries>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDiaryEntriesQueryResult = NonNullable<Awaited<ReturnType<typeof listDiaryEntries>>>;
export type ListDiaryEntriesQueryError = ErrorType<unknown>;
/**
 * @summary List diary entries for current user
 */
export declare function useListDiaryEntries<TData = Awaited<ReturnType<typeof listDiaryEntries>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDiaryEntries>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateDiaryEntryUrl: () => string;
/**
 * @summary Create a diary entry
 */
export declare const createDiaryEntry: (diaryEntryInput: DiaryEntryInput, options?: RequestInit) => Promise<DiaryEntry>;
export declare const getCreateDiaryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDiaryEntry>>, TError, {
        data: BodyType<DiaryEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDiaryEntry>>, TError, {
    data: BodyType<DiaryEntryInput>;
}, TContext>;
export type CreateDiaryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof createDiaryEntry>>>;
export type CreateDiaryEntryMutationBody = BodyType<DiaryEntryInput>;
export type CreateDiaryEntryMutationError = ErrorType<unknown>;
/**
* @summary Create a diary entry
*/
export declare const useCreateDiaryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDiaryEntry>>, TError, {
        data: BodyType<DiaryEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDiaryEntry>>, TError, {
    data: BodyType<DiaryEntryInput>;
}, TContext>;
export declare const getUpdateDiaryEntryUrl: (id: number) => string;
/**
 * @summary Update a diary entry
 */
export declare const updateDiaryEntry: (id: number, diaryEntryInput: DiaryEntryInput, options?: RequestInit) => Promise<DiaryEntry>;
export declare const getUpdateDiaryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDiaryEntry>>, TError, {
        id: number;
        data: BodyType<DiaryEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDiaryEntry>>, TError, {
    id: number;
    data: BodyType<DiaryEntryInput>;
}, TContext>;
export type UpdateDiaryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof updateDiaryEntry>>>;
export type UpdateDiaryEntryMutationBody = BodyType<DiaryEntryInput>;
export type UpdateDiaryEntryMutationError = ErrorType<unknown>;
/**
* @summary Update a diary entry
*/
export declare const useUpdateDiaryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDiaryEntry>>, TError, {
        id: number;
        data: BodyType<DiaryEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDiaryEntry>>, TError, {
    id: number;
    data: BodyType<DiaryEntryInput>;
}, TContext>;
export declare const getDeleteDiaryEntryUrl: (id: number) => string;
/**
 * @summary Delete a diary entry
 */
export declare const deleteDiaryEntry: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDiaryEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDiaryEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDiaryEntry>>, TError, {
    id: number;
}, TContext>;
export type DeleteDiaryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDiaryEntry>>>;
export type DeleteDiaryEntryMutationError = ErrorType<unknown>;
/**
* @summary Delete a diary entry
*/
export declare const useDeleteDiaryEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDiaryEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDiaryEntry>>, TError, {
    id: number;
}, TContext>;
export declare const getListCompetenciesUrl: (params?: ListCompetenciesParams) => string;
/**
 * @summary List competencies
 */
export declare const listCompetencies: (params?: ListCompetenciesParams, options?: RequestInit) => Promise<CompetencyItem[]>;
export declare const getListCompetenciesQueryKey: (params?: ListCompetenciesParams) => readonly ["/api/competencies", ...ListCompetenciesParams[]];
export declare const getListCompetenciesQueryOptions: <TData = Awaited<ReturnType<typeof listCompetencies>>, TError = ErrorType<unknown>>(params?: ListCompetenciesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCompetencies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCompetencies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCompetenciesQueryResult = NonNullable<Awaited<ReturnType<typeof listCompetencies>>>;
export type ListCompetenciesQueryError = ErrorType<unknown>;
/**
 * @summary List competencies
 */
export declare function useListCompetencies<TData = Awaited<ReturnType<typeof listCompetencies>>, TError = ErrorType<unknown>>(params?: ListCompetenciesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCompetencies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCompetencyUrl: () => string;
/**
 * @summary Create a competency definition
 */
export declare const createCompetency: (competencyInput: CompetencyInput, options?: RequestInit) => Promise<CompetencyItem>;
export declare const getCreateCompetencyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCompetency>>, TError, {
        data: BodyType<CompetencyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCompetency>>, TError, {
    data: BodyType<CompetencyInput>;
}, TContext>;
export type CreateCompetencyMutationResult = NonNullable<Awaited<ReturnType<typeof createCompetency>>>;
export type CreateCompetencyMutationBody = BodyType<CompetencyInput>;
export type CreateCompetencyMutationError = ErrorType<unknown>;
/**
* @summary Create a competency definition
*/
export declare const useCreateCompetency: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCompetency>>, TError, {
        data: BodyType<CompetencyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCompetency>>, TError, {
    data: BodyType<CompetencyInput>;
}, TContext>;
export declare const getListStudentCompetenciesUrl: (params?: ListStudentCompetenciesParams) => string;
/**
 * @summary List student competency assessments
 */
export declare const listStudentCompetencies: (params?: ListStudentCompetenciesParams, options?: RequestInit) => Promise<StudentCompetencyItem[]>;
export declare const getListStudentCompetenciesQueryKey: (params?: ListStudentCompetenciesParams) => readonly ["/api/student-competencies", ...ListStudentCompetenciesParams[]];
export declare const getListStudentCompetenciesQueryOptions: <TData = Awaited<ReturnType<typeof listStudentCompetencies>>, TError = ErrorType<unknown>>(params?: ListStudentCompetenciesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStudentCompetencies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listStudentCompetencies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListStudentCompetenciesQueryResult = NonNullable<Awaited<ReturnType<typeof listStudentCompetencies>>>;
export type ListStudentCompetenciesQueryError = ErrorType<unknown>;
/**
 * @summary List student competency assessments
 */
export declare function useListStudentCompetencies<TData = Awaited<ReturnType<typeof listStudentCompetencies>>, TError = ErrorType<unknown>>(params?: ListStudentCompetenciesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStudentCompetencies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateStudentCompetencyUrl: () => string;
/**
 * @summary Assess a student competency
 */
export declare const createStudentCompetency: (studentCompetencyInput: StudentCompetencyInput, options?: RequestInit) => Promise<StudentCompetencyItem>;
export declare const getCreateStudentCompetencyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStudentCompetency>>, TError, {
        data: BodyType<StudentCompetencyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStudentCompetency>>, TError, {
    data: BodyType<StudentCompetencyInput>;
}, TContext>;
export type CreateStudentCompetencyMutationResult = NonNullable<Awaited<ReturnType<typeof createStudentCompetency>>>;
export type CreateStudentCompetencyMutationBody = BodyType<StudentCompetencyInput>;
export type CreateStudentCompetencyMutationError = ErrorType<unknown>;
/**
* @summary Assess a student competency
*/
export declare const useCreateStudentCompetency: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStudentCompetency>>, TError, {
        data: BodyType<StudentCompetencyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStudentCompetency>>, TError, {
    data: BodyType<StudentCompetencyInput>;
}, TContext>;
export declare const getListForumThreadsUrl: (params?: ListForumThreadsParams) => string;
/**
 * @summary List forum threads
 */
export declare const listForumThreads: (params?: ListForumThreadsParams, options?: RequestInit) => Promise<ForumThread[]>;
export declare const getListForumThreadsQueryKey: (params?: ListForumThreadsParams) => readonly ["/api/forum/threads", ...ListForumThreadsParams[]];
export declare const getListForumThreadsQueryOptions: <TData = Awaited<ReturnType<typeof listForumThreads>>, TError = ErrorType<unknown>>(params?: ListForumThreadsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForumThreads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listForumThreads>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListForumThreadsQueryResult = NonNullable<Awaited<ReturnType<typeof listForumThreads>>>;
export type ListForumThreadsQueryError = ErrorType<unknown>;
/**
 * @summary List forum threads
 */
export declare function useListForumThreads<TData = Awaited<ReturnType<typeof listForumThreads>>, TError = ErrorType<unknown>>(params?: ListForumThreadsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForumThreads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateForumThreadUrl: () => string;
/**
 * @summary Create a forum thread
 */
export declare const createForumThread: (forumThreadInput: ForumThreadInput, options?: RequestInit) => Promise<ForumThread>;
export declare const getCreateForumThreadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createForumThread>>, TError, {
        data: BodyType<ForumThreadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createForumThread>>, TError, {
    data: BodyType<ForumThreadInput>;
}, TContext>;
export type CreateForumThreadMutationResult = NonNullable<Awaited<ReturnType<typeof createForumThread>>>;
export type CreateForumThreadMutationBody = BodyType<ForumThreadInput>;
export type CreateForumThreadMutationError = ErrorType<unknown>;
/**
* @summary Create a forum thread
*/
export declare const useCreateForumThread: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createForumThread>>, TError, {
        data: BodyType<ForumThreadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createForumThread>>, TError, {
    data: BodyType<ForumThreadInput>;
}, TContext>;
export declare const getListForumPostsUrl: (id: number) => string;
/**
 * @summary List posts in a thread
 */
export declare const listForumPosts: (id: number, options?: RequestInit) => Promise<ForumPost[]>;
export declare const getListForumPostsQueryKey: (id: number) => readonly [`/api/forum/threads/${number}/posts`];
export declare const getListForumPostsQueryOptions: <TData = Awaited<ReturnType<typeof listForumPosts>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForumPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listForumPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListForumPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listForumPosts>>>;
export type ListForumPostsQueryError = ErrorType<unknown>;
/**
 * @summary List posts in a thread
 */
export declare function useListForumPosts<TData = Awaited<ReturnType<typeof listForumPosts>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listForumPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateForumPostUrl: (id: number) => string;
/**
 * @summary Reply to a thread
 */
export declare const createForumPost: (id: number, forumPostInput: ForumPostInput, options?: RequestInit) => Promise<ForumPost>;
export declare const getCreateForumPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createForumPost>>, TError, {
        id: number;
        data: BodyType<ForumPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createForumPost>>, TError, {
    id: number;
    data: BodyType<ForumPostInput>;
}, TContext>;
export type CreateForumPostMutationResult = NonNullable<Awaited<ReturnType<typeof createForumPost>>>;
export type CreateForumPostMutationBody = BodyType<ForumPostInput>;
export type CreateForumPostMutationError = ErrorType<unknown>;
/**
* @summary Reply to a thread
*/
export declare const useCreateForumPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createForumPost>>, TError, {
        id: number;
        data: BodyType<ForumPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createForumPost>>, TError, {
    id: number;
    data: BodyType<ForumPostInput>;
}, TContext>;
export declare const getListPollsUrl: () => string;
/**
 * @summary List polls with vote counts
 */
export declare const listPolls: (options?: RequestInit) => Promise<PollDetail[]>;
export declare const getListPollsQueryKey: () => readonly ["/api/polls"];
export declare const getListPollsQueryOptions: <TData = Awaited<ReturnType<typeof listPolls>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPolls>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPolls>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPollsQueryResult = NonNullable<Awaited<ReturnType<typeof listPolls>>>;
export type ListPollsQueryError = ErrorType<unknown>;
/**
 * @summary List polls with vote counts
 */
export declare function useListPolls<TData = Awaited<ReturnType<typeof listPolls>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPolls>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePollUrl: () => string;
/**
 * @summary Create a poll
 */
export declare const createPoll: (pollInput: PollInput, options?: RequestInit) => Promise<PollDetail>;
export declare const getCreatePollMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPoll>>, TError, {
        data: BodyType<PollInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPoll>>, TError, {
    data: BodyType<PollInput>;
}, TContext>;
export type CreatePollMutationResult = NonNullable<Awaited<ReturnType<typeof createPoll>>>;
export type CreatePollMutationBody = BodyType<PollInput>;
export type CreatePollMutationError = ErrorType<unknown>;
/**
* @summary Create a poll
*/
export declare const useCreatePoll: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPoll>>, TError, {
        data: BodyType<PollInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPoll>>, TError, {
    data: BodyType<PollInput>;
}, TContext>;
export declare const getVotePollUrl: (id: number) => string;
/**
 * @summary Vote on a poll
 */
export declare const votePoll: (id: number, pollVoteInput: PollVoteInput, options?: RequestInit) => Promise<PollDetail>;
export declare const getVotePollMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof votePoll>>, TError, {
        id: number;
        data: BodyType<PollVoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof votePoll>>, TError, {
    id: number;
    data: BodyType<PollVoteInput>;
}, TContext>;
export type VotePollMutationResult = NonNullable<Awaited<ReturnType<typeof votePoll>>>;
export type VotePollMutationBody = BodyType<PollVoteInput>;
export type VotePollMutationError = ErrorType<unknown>;
/**
* @summary Vote on a poll
*/
export declare const useVotePoll: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof votePoll>>, TError, {
        id: number;
        data: BodyType<PollVoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof votePoll>>, TError, {
    id: number;
    data: BodyType<PollVoteInput>;
}, TContext>;
export declare const getUpdatePollStatusUrl: (id: number) => string;
/**
 * @summary Close or update poll
 */
export declare const updatePollStatus: (id: number, pollStatusInput: PollStatusInput, options?: RequestInit) => Promise<PollDetail>;
export declare const getUpdatePollStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePollStatus>>, TError, {
        id: number;
        data: BodyType<PollStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePollStatus>>, TError, {
    id: number;
    data: BodyType<PollStatusInput>;
}, TContext>;
export type UpdatePollStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updatePollStatus>>>;
export type UpdatePollStatusMutationBody = BodyType<PollStatusInput>;
export type UpdatePollStatusMutationError = ErrorType<unknown>;
/**
* @summary Close or update poll
*/
export declare const useUpdatePollStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePollStatus>>, TError, {
        id: number;
        data: BodyType<PollStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePollStatus>>, TError, {
    id: number;
    data: BodyType<PollStatusInput>;
}, TContext>;
export declare const getListFieldTripsUrl: () => string;
/**
 * @summary List field trips
 */
export declare const listFieldTrips: (options?: RequestInit) => Promise<FieldTrip[]>;
export declare const getListFieldTripsQueryKey: () => readonly ["/api/field-trips"];
export declare const getListFieldTripsQueryOptions: <TData = Awaited<ReturnType<typeof listFieldTrips>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFieldTrips>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFieldTrips>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFieldTripsQueryResult = NonNullable<Awaited<ReturnType<typeof listFieldTrips>>>;
export type ListFieldTripsQueryError = ErrorType<unknown>;
/**
 * @summary List field trips
 */
export declare function useListFieldTrips<TData = Awaited<ReturnType<typeof listFieldTrips>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFieldTrips>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFieldTripUrl: () => string;
/**
 * @summary Create a field trip
 */
export declare const createFieldTrip: (fieldTripInput: FieldTripInput, options?: RequestInit) => Promise<FieldTrip>;
export declare const getCreateFieldTripMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFieldTrip>>, TError, {
        data: BodyType<FieldTripInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFieldTrip>>, TError, {
    data: BodyType<FieldTripInput>;
}, TContext>;
export type CreateFieldTripMutationResult = NonNullable<Awaited<ReturnType<typeof createFieldTrip>>>;
export type CreateFieldTripMutationBody = BodyType<FieldTripInput>;
export type CreateFieldTripMutationError = ErrorType<unknown>;
/**
* @summary Create a field trip
*/
export declare const useCreateFieldTrip: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFieldTrip>>, TError, {
        data: BodyType<FieldTripInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFieldTrip>>, TError, {
    data: BodyType<FieldTripInput>;
}, TContext>;
export declare const getUpdateFieldTripStatusUrl: (id: number) => string;
/**
 * @summary Update field trip status
 */
export declare const updateFieldTripStatus: (id: number, fieldTripStatusInput: FieldTripStatusInput, options?: RequestInit) => Promise<FieldTrip>;
export declare const getUpdateFieldTripStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFieldTripStatus>>, TError, {
        id: number;
        data: BodyType<FieldTripStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFieldTripStatus>>, TError, {
    id: number;
    data: BodyType<FieldTripStatusInput>;
}, TContext>;
export type UpdateFieldTripStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateFieldTripStatus>>>;
export type UpdateFieldTripStatusMutationBody = BodyType<FieldTripStatusInput>;
export type UpdateFieldTripStatusMutationError = ErrorType<unknown>;
/**
* @summary Update field trip status
*/
export declare const useUpdateFieldTripStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFieldTripStatus>>, TError, {
        id: number;
        data: BodyType<FieldTripStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFieldTripStatus>>, TError, {
    id: number;
    data: BodyType<FieldTripStatusInput>;
}, TContext>;
export declare const getJoinFieldTripUrl: (id: number) => string;
/**
 * @summary Student joins a field trip
 */
export declare const joinFieldTrip: (id: number, options?: RequestInit) => Promise<FieldTripParticipant>;
export declare const getJoinFieldTripMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinFieldTrip>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof joinFieldTrip>>, TError, {
    id: number;
}, TContext>;
export type JoinFieldTripMutationResult = NonNullable<Awaited<ReturnType<typeof joinFieldTrip>>>;
export type JoinFieldTripMutationError = ErrorType<unknown>;
/**
* @summary Student joins a field trip
*/
export declare const useJoinFieldTrip: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof joinFieldTrip>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof joinFieldTrip>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateParticipantStatusUrl: (id: number, studentId: number) => string;
/**
 * @summary Approve or decline a participant
 */
export declare const updateParticipantStatus: (id: number, studentId: number, participantStatusInput: ParticipantStatusInput, options?: RequestInit) => Promise<FieldTripParticipant>;
export declare const getUpdateParticipantStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateParticipantStatus>>, TError, {
        id: number;
        studentId: number;
        data: BodyType<ParticipantStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateParticipantStatus>>, TError, {
    id: number;
    studentId: number;
    data: BodyType<ParticipantStatusInput>;
}, TContext>;
export type UpdateParticipantStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateParticipantStatus>>>;
export type UpdateParticipantStatusMutationBody = BodyType<ParticipantStatusInput>;
export type UpdateParticipantStatusMutationError = ErrorType<unknown>;
/**
* @summary Approve or decline a participant
*/
export declare const useUpdateParticipantStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateParticipantStatus>>, TError, {
        id: number;
        studentId: number;
        data: BodyType<ParticipantStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateParticipantStatus>>, TError, {
    id: number;
    studentId: number;
    data: BodyType<ParticipantStatusInput>;
}, TContext>;
export declare const getListFieldTripParticipantsUrl: (id: number) => string;
/**
 * @summary List participants of a field trip
 */
export declare const listFieldTripParticipants: (id: number, options?: RequestInit) => Promise<FieldTripParticipant[]>;
export declare const getListFieldTripParticipantsQueryKey: (id: number) => readonly [`/api/field-trips/${number}/participants`];
export declare const getListFieldTripParticipantsQueryOptions: <TData = Awaited<ReturnType<typeof listFieldTripParticipants>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFieldTripParticipants>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFieldTripParticipants>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFieldTripParticipantsQueryResult = NonNullable<Awaited<ReturnType<typeof listFieldTripParticipants>>>;
export type ListFieldTripParticipantsQueryError = ErrorType<unknown>;
/**
 * @summary List participants of a field trip
 */
export declare function useListFieldTripParticipants<TData = Awaited<ReturnType<typeof listFieldTripParticipants>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFieldTripParticipants>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListRoomsUrl: () => string;
/**
 * @summary List rooms
 */
export declare const listRooms: (options?: RequestInit) => Promise<Room[]>;
export declare const getListRoomsQueryKey: () => readonly ["/api/rooms"];
export declare const getListRoomsQueryOptions: <TData = Awaited<ReturnType<typeof listRooms>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRoomsQueryResult = NonNullable<Awaited<ReturnType<typeof listRooms>>>;
export type ListRoomsQueryError = ErrorType<unknown>;
/**
 * @summary List rooms
 */
export declare function useListRooms<TData = Awaited<ReturnType<typeof listRooms>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRooms>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRoomUrl: () => string;
/**
 * @summary Create a room
 */
export declare const createRoom: (roomInput: RoomInput, options?: RequestInit) => Promise<Room>;
export declare const getCreateRoomMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
        data: BodyType<RoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
    data: BodyType<RoomInput>;
}, TContext>;
export type CreateRoomMutationResult = NonNullable<Awaited<ReturnType<typeof createRoom>>>;
export type CreateRoomMutationBody = BodyType<RoomInput>;
export type CreateRoomMutationError = ErrorType<unknown>;
/**
* @summary Create a room
*/
export declare const useCreateRoom: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoom>>, TError, {
        data: BodyType<RoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRoom>>, TError, {
    data: BodyType<RoomInput>;
}, TContext>;
export declare const getListRoomBookingsUrl: (params?: ListRoomBookingsParams) => string;
/**
 * @summary List room bookings
 */
export declare const listRoomBookings: (params?: ListRoomBookingsParams, options?: RequestInit) => Promise<RoomBooking[]>;
export declare const getListRoomBookingsQueryKey: (params?: ListRoomBookingsParams) => readonly ["/api/room-bookings", ...ListRoomBookingsParams[]];
export declare const getListRoomBookingsQueryOptions: <TData = Awaited<ReturnType<typeof listRoomBookings>>, TError = ErrorType<unknown>>(params?: ListRoomBookingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRoomBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRoomBookings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRoomBookingsQueryResult = NonNullable<Awaited<ReturnType<typeof listRoomBookings>>>;
export type ListRoomBookingsQueryError = ErrorType<unknown>;
/**
 * @summary List room bookings
 */
export declare function useListRoomBookings<TData = Awaited<ReturnType<typeof listRoomBookings>>, TError = ErrorType<unknown>>(params?: ListRoomBookingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRoomBookings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRoomBookingUrl: () => string;
/**
 * @summary Book a room
 */
export declare const createRoomBooking: (roomBookingInput: RoomBookingInput, options?: RequestInit) => Promise<RoomBooking>;
export declare const getCreateRoomBookingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoomBooking>>, TError, {
        data: BodyType<RoomBookingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRoomBooking>>, TError, {
    data: BodyType<RoomBookingInput>;
}, TContext>;
export type CreateRoomBookingMutationResult = NonNullable<Awaited<ReturnType<typeof createRoomBooking>>>;
export type CreateRoomBookingMutationBody = BodyType<RoomBookingInput>;
export type CreateRoomBookingMutationError = ErrorType<unknown>;
/**
* @summary Book a room
*/
export declare const useCreateRoomBooking: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRoomBooking>>, TError, {
        data: BodyType<RoomBookingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRoomBooking>>, TError, {
    data: BodyType<RoomBookingInput>;
}, TContext>;
export declare const getDeleteRoomBookingUrl: (id: number) => string;
/**
 * @summary Delete a room booking
 */
export declare const deleteRoomBooking: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteRoomBookingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRoomBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteRoomBooking>>, TError, {
    id: number;
}, TContext>;
export type DeleteRoomBookingMutationResult = NonNullable<Awaited<ReturnType<typeof deleteRoomBooking>>>;
export type DeleteRoomBookingMutationError = ErrorType<unknown>;
/**
* @summary Delete a room booking
*/
export declare const useDeleteRoomBooking: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteRoomBooking>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteRoomBooking>>, TError, {
    id: number;
}, TContext>;
export declare const getGetAnalyticsSummaryUrl: () => string;
/**
 * @summary Get aggregated analytics data
 */
export declare const getAnalyticsSummary: (options?: RequestInit) => Promise<AnalyticsSummary>;
export declare const getGetAnalyticsSummaryQueryKey: () => readonly ["/api/analytics/summary"];
export declare const getGetAnalyticsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getAnalyticsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalyticsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalyticsSummary>>>;
export type GetAnalyticsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get aggregated analytics data
 */
export declare function useGetAnalyticsSummary<TData = Awaited<ReturnType<typeof getAnalyticsSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getDownloadCertificateUrl: (type: "iscrizione" | "frequenza" | "pagella") => string;
/**
 * @summary Download a certificate as PDF
 */
export declare const downloadCertificate: (type: "iscrizione" | "frequenza" | "pagella", options?: RequestInit) => Promise<Blob>;
export declare const getDownloadCertificateQueryKey: (type: "iscrizione" | "frequenza" | "pagella") => readonly ["/api/certificates/iscrizione" | "/api/certificates/frequenza" | "/api/certificates/pagella"];
export declare const getDownloadCertificateQueryOptions: <TData = Awaited<ReturnType<typeof downloadCertificate>>, TError = ErrorType<unknown>>(type: "iscrizione" | "frequenza" | "pagella", options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof downloadCertificate>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof downloadCertificate>>, TError, TData> & {
    queryKey: QueryKey;
};
export type DownloadCertificateQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCertificate>>>;
export type DownloadCertificateQueryError = ErrorType<unknown>;
/**
 * @summary Download a certificate as PDF
 */
export declare function useDownloadCertificate<TData = Awaited<ReturnType<typeof downloadCertificate>>, TError = ErrorType<unknown>>(type: 'iscrizione' | 'frequenza' | 'pagella', options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof downloadCertificate>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListScheduleUrl: (params: ListScheduleParams) => string;
/**
 * @summary Get schedule for a class
 */
export declare const listSchedule: (params: ListScheduleParams, options?: RequestInit) => Promise<ScheduleEntry[]>;
export declare const getListScheduleQueryKey: (params?: ListScheduleParams) => readonly ["/api/schedule", ...ListScheduleParams[]];
export declare const getListScheduleQueryOptions: <TData = Awaited<ReturnType<typeof listSchedule>>, TError = ErrorType<unknown>>(params: ListScheduleParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSchedule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSchedule>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListScheduleQueryResult = NonNullable<Awaited<ReturnType<typeof listSchedule>>>;
export type ListScheduleQueryError = ErrorType<unknown>;
/**
 * @summary Get schedule for a class
 */
export declare function useListSchedule<TData = Awaited<ReturnType<typeof listSchedule>>, TError = ErrorType<unknown>>(params: ListScheduleParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSchedule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateScheduleEntryUrl: () => string;
/**
 * @summary Create a schedule entry
 */
export declare const createScheduleEntry: (scheduleEntryInput: ScheduleEntryInput, options?: RequestInit) => Promise<ScheduleEntry>;
export declare const getCreateScheduleEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createScheduleEntry>>, TError, {
        data: BodyType<ScheduleEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createScheduleEntry>>, TError, {
    data: BodyType<ScheduleEntryInput>;
}, TContext>;
export type CreateScheduleEntryMutationResult = NonNullable<Awaited<ReturnType<typeof createScheduleEntry>>>;
export type CreateScheduleEntryMutationBody = BodyType<ScheduleEntryInput>;
export type CreateScheduleEntryMutationError = ErrorType<unknown>;
/**
* @summary Create a schedule entry
*/
export declare const useCreateScheduleEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createScheduleEntry>>, TError, {
        data: BodyType<ScheduleEntryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createScheduleEntry>>, TError, {
    data: BodyType<ScheduleEntryInput>;
}, TContext>;
export declare const getDeleteScheduleEntryUrl: (id: number) => string;
/**
 * @summary Delete a schedule entry
 */
export declare const deleteScheduleEntry: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteScheduleEntryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteScheduleEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteScheduleEntry>>, TError, {
    id: number;
}, TContext>;
export type DeleteScheduleEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteScheduleEntry>>>;
export type DeleteScheduleEntryMutationError = ErrorType<unknown>;
/**
* @summary Delete a schedule entry
*/
export declare const useDeleteScheduleEntry: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteScheduleEntry>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteScheduleEntry>>, TError, {
    id: number;
}, TContext>;
export declare const getListJustificationsUrl: (params?: ListJustificationsParams) => string;
/**
 * @summary List justifications
 */
export declare const listJustifications: (params?: ListJustificationsParams, options?: RequestInit) => Promise<Justification[]>;
export declare const getListJustificationsQueryKey: (params?: ListJustificationsParams) => readonly ["/api/justifications", ...ListJustificationsParams[]];
export declare const getListJustificationsQueryOptions: <TData = Awaited<ReturnType<typeof listJustifications>>, TError = ErrorType<unknown>>(params?: ListJustificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJustifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJustifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJustificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listJustifications>>>;
export type ListJustificationsQueryError = ErrorType<unknown>;
/**
 * @summary List justifications
 */
export declare function useListJustifications<TData = Awaited<ReturnType<typeof listJustifications>>, TError = ErrorType<unknown>>(params?: ListJustificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJustifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateJustificationUrl: () => string;
/**
 * @summary Submit a justification
 */
export declare const createJustification: (justificationInput: JustificationInput, options?: RequestInit) => Promise<Justification>;
export declare const getCreateJustificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJustification>>, TError, {
        data: BodyType<JustificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createJustification>>, TError, {
    data: BodyType<JustificationInput>;
}, TContext>;
export type CreateJustificationMutationResult = NonNullable<Awaited<ReturnType<typeof createJustification>>>;
export type CreateJustificationMutationBody = BodyType<JustificationInput>;
export type CreateJustificationMutationError = ErrorType<unknown>;
/**
* @summary Submit a justification
*/
export declare const useCreateJustification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJustification>>, TError, {
        data: BodyType<JustificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createJustification>>, TError, {
    data: BodyType<JustificationInput>;
}, TContext>;
export declare const getReviewJustificationUrl: (id: number) => string;
/**
 * @summary Approve or reject a justification
 */
export declare const reviewJustification: (id: number, justificationReviewInput: JustificationReviewInput, options?: RequestInit) => Promise<Justification>;
export declare const getReviewJustificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reviewJustification>>, TError, {
        id: number;
        data: BodyType<JustificationReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof reviewJustification>>, TError, {
    id: number;
    data: BodyType<JustificationReviewInput>;
}, TContext>;
export type ReviewJustificationMutationResult = NonNullable<Awaited<ReturnType<typeof reviewJustification>>>;
export type ReviewJustificationMutationBody = BodyType<JustificationReviewInput>;
export type ReviewJustificationMutationError = ErrorType<unknown>;
/**
* @summary Approve or reject a justification
*/
export declare const useReviewJustification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof reviewJustification>>, TError, {
        id: number;
        data: BodyType<JustificationReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof reviewJustification>>, TError, {
    id: number;
    data: BodyType<JustificationReviewInput>;
}, TContext>;
export declare const getListAppointmentsUrl: (params?: ListAppointmentsParams) => string;
/**
 * @summary List appointments
 */
export declare const listAppointments: (params?: ListAppointmentsParams, options?: RequestInit) => Promise<Appointment[]>;
export declare const getListAppointmentsQueryKey: (params?: ListAppointmentsParams) => readonly ["/api/appointments", ...ListAppointmentsParams[]];
export declare const getListAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listAppointments>>>;
export type ListAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List appointments
 */
export declare function useListAppointments<TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAppointmentUrl: () => string;
/**
 * @summary Book an appointment with a teacher
 */
export declare const createAppointment: (appointmentInput: AppointmentInput, options?: RequestInit) => Promise<Appointment>;
export declare const getCreateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export type CreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAppointment>>>;
export type CreateAppointmentMutationBody = BodyType<AppointmentInput>;
export type CreateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Book an appointment with a teacher
*/
export declare const useCreateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export declare const getUpdateAppointmentUrl: (id: number) => string;
/**
 * @summary Confirm or cancel an appointment
 */
export declare const updateAppointment: (id: number, appointmentStatusInput: AppointmentStatusInput, options?: RequestInit) => Promise<Appointment>;
export declare const getUpdateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentStatusInput>;
}, TContext>;
export type UpdateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAppointment>>>;
export type UpdateAppointmentMutationBody = BodyType<AppointmentStatusInput>;
export type UpdateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Confirm or cancel an appointment
*/
export declare const useUpdateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentStatusInput>;
}, TContext>;
export declare const getListNotificationsUrl: () => string;
/**
 * @summary List my notifications
 */
export declare const listNotifications: (options?: RequestInit) => Promise<AppNotification[]>;
export declare const getListNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List my notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkAllNotificationsReadUrl: () => string;
/**
 * @summary Mark all notifications as read
 */
export declare const markAllNotificationsRead: (options?: RequestInit) => Promise<MarkAllNotificationsRead200>;
export declare const getMarkAllNotificationsReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export type MarkAllNotificationsReadMutationResult = NonNullable<Awaited<ReturnType<typeof markAllNotificationsRead>>>;
export type MarkAllNotificationsReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all notifications as read
*/
export declare const useMarkAllNotificationsRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export declare const getMarkNotificationReadUrl: (id: number) => string;
/**
 * @summary Mark a notification as read
 */
export declare const markNotificationRead: (id: number, options?: RequestInit) => Promise<AppNotification>;
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<unknown>;
/**
* @summary Mark a notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export declare const getListBehaviorNotesUrl: (params?: ListBehaviorNotesParams) => string;
/**
 * @summary List behavior notes
 */
export declare const listBehaviorNotes: (params?: ListBehaviorNotesParams, options?: RequestInit) => Promise<BehaviorNote[]>;
export declare const getListBehaviorNotesQueryKey: (params?: ListBehaviorNotesParams) => readonly ["/api/behavior-notes", ...ListBehaviorNotesParams[]];
export declare const getListBehaviorNotesQueryOptions: <TData = Awaited<ReturnType<typeof listBehaviorNotes>>, TError = ErrorType<unknown>>(params?: ListBehaviorNotesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBehaviorNotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBehaviorNotes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBehaviorNotesQueryResult = NonNullable<Awaited<ReturnType<typeof listBehaviorNotes>>>;
export type ListBehaviorNotesQueryError = ErrorType<unknown>;
/**
 * @summary List behavior notes
 */
export declare function useListBehaviorNotes<TData = Awaited<ReturnType<typeof listBehaviorNotes>>, TError = ErrorType<unknown>>(params?: ListBehaviorNotesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBehaviorNotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBehaviorNoteUrl: () => string;
/**
 * @summary Create a behavior note
 */
export declare const createBehaviorNote: (behaviorNoteInput: BehaviorNoteInput, options?: RequestInit) => Promise<BehaviorNote>;
export declare const getCreateBehaviorNoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBehaviorNote>>, TError, {
        data: BodyType<BehaviorNoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBehaviorNote>>, TError, {
    data: BodyType<BehaviorNoteInput>;
}, TContext>;
export type CreateBehaviorNoteMutationResult = NonNullable<Awaited<ReturnType<typeof createBehaviorNote>>>;
export type CreateBehaviorNoteMutationBody = BodyType<BehaviorNoteInput>;
export type CreateBehaviorNoteMutationError = ErrorType<unknown>;
/**
* @summary Create a behavior note
*/
export declare const useCreateBehaviorNote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBehaviorNote>>, TError, {
        data: BodyType<BehaviorNoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBehaviorNote>>, TError, {
    data: BodyType<BehaviorNoteInput>;
}, TContext>;
export declare const getDeleteBehaviorNoteUrl: (id: number) => string;
/**
 * @summary Delete a behavior note
 */
export declare const deleteBehaviorNote: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBehaviorNoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBehaviorNote>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBehaviorNote>>, TError, {
    id: number;
}, TContext>;
export type DeleteBehaviorNoteMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBehaviorNote>>>;
export type DeleteBehaviorNoteMutationError = ErrorType<unknown>;
/**
* @summary Delete a behavior note
*/
export declare const useDeleteBehaviorNote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBehaviorNote>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBehaviorNote>>, TError, {
    id: number;
}, TContext>;
export declare const getListTutoringPostsUrl: (params?: ListTutoringPostsParams) => string;
/**
 * @summary List tutoring posts
 */
export declare const listTutoringPosts: (params?: ListTutoringPostsParams, options?: RequestInit) => Promise<TutoringPost[]>;
export declare const getListTutoringPostsQueryKey: (params?: ListTutoringPostsParams) => readonly ["/api/tutoring", ...ListTutoringPostsParams[]];
export declare const getListTutoringPostsQueryOptions: <TData = Awaited<ReturnType<typeof listTutoringPosts>>, TError = ErrorType<unknown>>(params?: ListTutoringPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTutoringPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTutoringPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTutoringPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listTutoringPosts>>>;
export type ListTutoringPostsQueryError = ErrorType<unknown>;
/**
 * @summary List tutoring posts
 */
export declare function useListTutoringPosts<TData = Awaited<ReturnType<typeof listTutoringPosts>>, TError = ErrorType<unknown>>(params?: ListTutoringPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTutoringPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTutoringPostUrl: () => string;
/**
 * @summary Create a tutoring post
 */
export declare const createTutoringPost: (tutoringPostInput: TutoringPostInput, options?: RequestInit) => Promise<TutoringPost>;
export declare const getCreateTutoringPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTutoringPost>>, TError, {
        data: BodyType<TutoringPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTutoringPost>>, TError, {
    data: BodyType<TutoringPostInput>;
}, TContext>;
export type CreateTutoringPostMutationResult = NonNullable<Awaited<ReturnType<typeof createTutoringPost>>>;
export type CreateTutoringPostMutationBody = BodyType<TutoringPostInput>;
export type CreateTutoringPostMutationError = ErrorType<unknown>;
/**
* @summary Create a tutoring post
*/
export declare const useCreateTutoringPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTutoringPost>>, TError, {
        data: BodyType<TutoringPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTutoringPost>>, TError, {
    data: BodyType<TutoringPostInput>;
}, TContext>;
export declare const getUpdateTutoringPostUrl: (id: number) => string;
/**
 * @summary Update tutoring post status
 */
export declare const updateTutoringPost: (id: number, tutoringPostStatusInput: TutoringPostStatusInput, options?: RequestInit) => Promise<TutoringPost>;
export declare const getUpdateTutoringPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTutoringPost>>, TError, {
        id: number;
        data: BodyType<TutoringPostStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTutoringPost>>, TError, {
    id: number;
    data: BodyType<TutoringPostStatusInput>;
}, TContext>;
export type UpdateTutoringPostMutationResult = NonNullable<Awaited<ReturnType<typeof updateTutoringPost>>>;
export type UpdateTutoringPostMutationBody = BodyType<TutoringPostStatusInput>;
export type UpdateTutoringPostMutationError = ErrorType<unknown>;
/**
* @summary Update tutoring post status
*/
export declare const useUpdateTutoringPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTutoringPost>>, TError, {
        id: number;
        data: BodyType<TutoringPostStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTutoringPost>>, TError, {
    id: number;
    data: BodyType<TutoringPostStatusInput>;
}, TContext>;
export declare const getDeleteTutoringPostUrl: (id: number) => string;
/**
 * @summary Delete a tutoring post
 */
export declare const deleteTutoringPost: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteTutoringPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTutoringPost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTutoringPost>>, TError, {
    id: number;
}, TContext>;
export type DeleteTutoringPostMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTutoringPost>>>;
export type DeleteTutoringPostMutationError = ErrorType<unknown>;
/**
* @summary Delete a tutoring post
*/
export declare const useDeleteTutoringPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTutoringPost>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTutoringPost>>, TError, {
    id: number;
}, TContext>;
export declare const getGetEmailAccountUrl: () => string;
/**
 * @summary Get current user email account config (no password)
 */
export declare const getEmailAccount: (options?: RequestInit) => Promise<EmailAccountConfig>;
export declare const getGetEmailAccountQueryKey: () => readonly ["/api/email/account"];
export declare const getGetEmailAccountQueryOptions: <TData = Awaited<ReturnType<typeof getEmailAccount>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailAccount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmailAccount>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmailAccountQueryResult = NonNullable<Awaited<ReturnType<typeof getEmailAccount>>>;
export type GetEmailAccountQueryError = ErrorType<void>;
/**
 * @summary Get current user email account config (no password)
 */
export declare function useGetEmailAccount<TData = Awaited<ReturnType<typeof getEmailAccount>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailAccount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSaveEmailAccountUrl: () => string;
/**
 * @summary Save email account credentials
 */
export declare const saveEmailAccount: (emailAccountCredentials: EmailAccountCredentials, options?: RequestInit) => Promise<EmailAccountConfig>;
export declare const getSaveEmailAccountMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof saveEmailAccount>>, TError, {
        data: BodyType<EmailAccountCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof saveEmailAccount>>, TError, {
    data: BodyType<EmailAccountCredentials>;
}, TContext>;
export type SaveEmailAccountMutationResult = NonNullable<Awaited<ReturnType<typeof saveEmailAccount>>>;
export type SaveEmailAccountMutationBody = BodyType<EmailAccountCredentials>;
export type SaveEmailAccountMutationError = ErrorType<unknown>;
/**
* @summary Save email account credentials
*/
export declare const useSaveEmailAccount: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof saveEmailAccount>>, TError, {
        data: BodyType<EmailAccountCredentials>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof saveEmailAccount>>, TError, {
    data: BodyType<EmailAccountCredentials>;
}, TContext>;
export declare const getGetEmailInboxUrl: (params?: GetEmailInboxParams) => string;
/**
 * @summary Fetch inbox messages via IMAP
 */
export declare const getEmailInbox: (params?: GetEmailInboxParams, options?: RequestInit) => Promise<EmailHeader[]>;
export declare const getGetEmailInboxQueryKey: (params?: GetEmailInboxParams) => readonly ["/api/email/inbox", ...GetEmailInboxParams[]];
export declare const getGetEmailInboxQueryOptions: <TData = Awaited<ReturnType<typeof getEmailInbox>>, TError = ErrorType<void>>(params?: GetEmailInboxParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailInbox>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmailInbox>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmailInboxQueryResult = NonNullable<Awaited<ReturnType<typeof getEmailInbox>>>;
export type GetEmailInboxQueryError = ErrorType<void>;
/**
 * @summary Fetch inbox messages via IMAP
 */
export declare function useGetEmailInbox<TData = Awaited<ReturnType<typeof getEmailInbox>>, TError = ErrorType<void>>(params?: GetEmailInboxParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailInbox>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetEmailMessageUrl: (uid: number) => string;
/**
 * @summary Fetch single email body via IMAP
 */
export declare const getEmailMessage: (uid: number, options?: RequestInit) => Promise<EmailMessage>;
export declare const getGetEmailMessageQueryKey: (uid: number) => readonly [`/api/email/message/${number}`];
export declare const getGetEmailMessageQueryOptions: <TData = Awaited<ReturnType<typeof getEmailMessage>>, TError = ErrorType<unknown>>(uid: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailMessage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmailMessage>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmailMessageQueryResult = NonNullable<Awaited<ReturnType<typeof getEmailMessage>>>;
export type GetEmailMessageQueryError = ErrorType<unknown>;
/**
 * @summary Fetch single email body via IMAP
 */
export declare function useGetEmailMessage<TData = Awaited<ReturnType<typeof getEmailMessage>>, TError = ErrorType<unknown>>(uid: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmailMessage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendEmailUrl: () => string;
/**
 * @summary Send email via SMTP
 */
export declare const sendEmail: (emailComposeRequest: EmailComposeRequest, options?: RequestInit) => Promise<SendEmail200>;
export declare const getSendEmailMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendEmail>>, TError, {
        data: BodyType<EmailComposeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendEmail>>, TError, {
    data: BodyType<EmailComposeRequest>;
}, TContext>;
export type SendEmailMutationResult = NonNullable<Awaited<ReturnType<typeof sendEmail>>>;
export type SendEmailMutationBody = BodyType<EmailComposeRequest>;
export type SendEmailMutationError = ErrorType<unknown>;
/**
* @summary Send email via SMTP
*/
export declare const useSendEmail: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendEmail>>, TError, {
        data: BodyType<EmailComposeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendEmail>>, TError, {
    data: BodyType<EmailComposeRequest>;
}, TContext>;
export declare const getListGroupMessagesUrl: (params: ListGroupMessagesParams) => string;
/**
 * @summary List class group messages
 */
export declare const listGroupMessages: (params: ListGroupMessagesParams, options?: RequestInit) => Promise<ClassMessage[]>;
export declare const getListGroupMessagesQueryKey: (params?: ListGroupMessagesParams) => readonly ["/api/groups/messages", ...ListGroupMessagesParams[]];
export declare const getListGroupMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listGroupMessages>>, TError = ErrorType<unknown>>(params: ListGroupMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGroupMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGroupMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGroupMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listGroupMessages>>>;
export type ListGroupMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List class group messages
 */
export declare function useListGroupMessages<TData = Awaited<ReturnType<typeof listGroupMessages>>, TError = ErrorType<unknown>>(params: ListGroupMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGroupMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGroupMessageUrl: () => string;
/**
 * @summary Post a message to the class group
 */
export declare const createGroupMessage: (createClassMessageBody: CreateClassMessageBody, options?: RequestInit) => Promise<ClassMessage>;
export declare const getCreateGroupMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGroupMessage>>, TError, {
        data: BodyType<CreateClassMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGroupMessage>>, TError, {
    data: BodyType<CreateClassMessageBody>;
}, TContext>;
export type CreateGroupMessageMutationResult = NonNullable<Awaited<ReturnType<typeof createGroupMessage>>>;
export type CreateGroupMessageMutationBody = BodyType<CreateClassMessageBody>;
export type CreateGroupMessageMutationError = ErrorType<unknown>;
/**
* @summary Post a message to the class group
*/
export declare const useCreateGroupMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGroupMessage>>, TError, {
        data: BodyType<CreateClassMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGroupMessage>>, TError, {
    data: BodyType<CreateClassMessageBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map