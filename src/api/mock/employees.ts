import type { Employee } from '@/api/types';

/** 목(mock) 인사 정보. 실서버 연동 시 삭제한다. */
export const MOCK_EMPLOYEES: (Employee & { password: string })[] = [
  {
    id: 'emp-1001',
    employeeNo: '1001',
    name: '김민준',
    department: '개발팀',
    position: '팀장',
    password: '1234',
  },
  {
    id: 'emp-1002',
    employeeNo: '1002',
    name: '이서연',
    department: '개발팀',
    position: '사원',
    password: '1234',
  },
  {
    id: 'emp-2001',
    employeeNo: '2001',
    name: '박지호',
    department: '영업팀',
    position: '대리',
    password: '1234',
  },
];
