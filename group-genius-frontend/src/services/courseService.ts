import { courseApi } from '@/lib/api/courseApi';
import { CourseStats } from '@/types/course';

// Minimal service wrapper that delegates to the canonical API client in src/lib/api/courseApi
// All mock/dummy data removed — the app will display only the database-backed courses.
export const courseService = {
  getAllCourses: courseApi.getAllCourses,
  searchCourses: courseApi.searchCourses,
  getCourseById: courseApi.getCourse,

  getUserCourses: courseApi.getUserCourses,
  enrollInCourse: courseApi.enrollInCourse,
  dropCourse: courseApi.dropCourse,
  getCoursePeers: courseApi.getCoursePeers,

  getCourseStats: async (): Promise<CourseStats> => {
    try {
      const resp = await courseApi.getUserCourses();
      const enrollments = Array.isArray(resp) ? resp : (resp?.courses || []);
  const totalCourses = enrollments.length;
      return {
        totalCourses,
        averageProgress: 0,
        studyGroupsCount: 0
      };
    } catch (err) {
      return {
        totalCourses: 0,
        averageProgress: 0,
        studyGroupsCount: 0
      };
    }
  }
};

export default courseService;