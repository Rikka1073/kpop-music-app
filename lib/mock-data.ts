import type { KpopGroup, KpopSong } from './kpop-service'
import type { LineDistribution, Member, Line } from '@/types/line-distribution'

// モックグループデータ
export const mockGroups: KpopGroup[] = [
  {
    id: 'group-1',
    name: 'BLACKPINK',
    color: '#FF1493',
    songs: [
      {
        id: 'song-1',
        title: 'How You Like That',
        releaseYear: '2020',
        duration: '3:01',
        youtubeId: 'ioNng23DkIM',
        distributionId: 'dist-1',
      },
      {
        id: 'song-2',
        title: 'DDU-DU DDU-DU',
        releaseYear: '2018',
        duration: '3:29',
        youtubeId: 'IHNzOHi8sJs',
        distributionId: 'dist-2',
      },
    ],
  },
  {
    id: 'group-2',
    name: 'BTS',
    color: '#9370DB',
    songs: [
      {
        id: 'song-3',
        title: 'Dynamite',
        releaseYear: '2020',
        duration: '3:19',
        youtubeId: 'gdZLi9oWNZg',
        distributionId: 'dist-3',
      },
      {
        id: 'song-4',
        title: 'Butter',
        releaseYear: '2021',
        duration: '2:44',
        youtubeId: '7tNtU5XFwrU',
        distributionId: 'dist-4',
      },
    ],
  },
  {
    id: 'group-3',
    name: 'TWICE',
    color: '#FF69B4',
    songs: [
      {
        id: 'song-5',
        title: 'Fancy',
        releaseYear: '2019',
        duration: '3:34',
        youtubeId: 'kOHB85vDuow',
        distributionId: 'dist-5',
      },
      {
        id: 'song-6',
        title: 'Feel Special',
        releaseYear: '2019',
        duration: '3:27',
        youtubeId: '3ymwOvzhwHs',
        distributionId: 'dist-6',
      },
    ],
  },
]

// モックの配分データ
export const mockDistributions: Record<string, LineDistribution> = {
  'dist-1': {
    id: 'dist-1',
    youtubeId: 'ioNng23DkIM',
    groupName: 'BLACKPINK',
    songTitle: 'How You Like That',
    totalDuration: 181,
    members: [
      { id: 'member-1', name: 'Jisoo', color: '#FF5733' },
      { id: 'member-2', name: 'Jennie', color: '#33FF57' },
      { id: 'member-3', name: 'Rosé', color: '#3357FF' },
      { id: 'member-4', name: 'Lisa', color: '#FF33A8' },
    ],
    lines: [
      { id: 'line-1', memberId: 'member-1', startTime: 10, endTime: 15 },
      { id: 'line-2', memberId: 'member-2', startTime: 20, endTime: 30 },
      { id: 'line-3', memberId: 'member-3', startTime: 35, endTime: 45 },
      { id: 'line-4', memberId: 'member-4', startTime: 50, endTime: 65 },
    ],
  },
  'dist-3': {
    id: 'dist-3',
    youtubeId: 'gdZLi9oWNZg',
    groupName: 'BTS',
    songTitle: 'Dynamite',
    totalDuration: 199,
    members: [
      { id: 'member-5', name: 'RM', color: '#5D3FD3' },
      { id: 'member-6', name: 'Jin', color: '#FF6B6B' },
      { id: 'member-7', name: 'Suga', color: '#4CAF50' },
      { id: 'member-8', name: 'J-Hope', color: '#FFC107' },
      { id: 'member-9', name: 'Jimin', color: '#03A9F4' },
      { id: 'member-10', name: 'V', color: '#9C27B0' },
      { id: 'member-11', name: 'Jungkook', color: '#E91E63' },
    ],
    lines: [
      { id: 'line-5', memberId: 'member-5', startTime: 15, endTime: 25 },
      { id: 'line-6', memberId: 'member-6', startTime: 30, endTime: 40 },
      { id: 'line-7', memberId: 'member-7', startTime: 45, endTime: 55 },
      { id: 'line-8', memberId: 'member-8', startTime: 60, endTime: 70 },
      { id: 'line-9', memberId: 'member-9', startTime: 75, endTime: 85 },
      { id: 'line-10', memberId: 'member-10', startTime: 90, endTime: 100 },
      { id: 'line-11', memberId: 'member-11', startTime: 105, endTime: 120 },
    ],
  },
  'dist-5': {
    id: 'dist-5',
    youtubeId: 'kOHB85vDuow',
    groupName: 'TWICE',
    songTitle: 'Fancy',
    totalDuration: 214,
    members: [
      { id: 'member-12', name: 'Nayeon', color: '#FF9800' },
      { id: 'member-13', name: 'Jeongyeon', color: '#8BC34A' },
      { id: 'member-14', name: 'Momo', color: '#F44336' },
      { id: 'member-15', name: 'Sana', color: '#FFEB3B' },
      { id: 'member-16', name: 'Jihyo', color: '#3F51B5' },
      { id: 'member-17', name: 'Mina', color: '#00BCD4' },
      { id: 'member-18', name: 'Dahyun', color: '#CDDC39' },
      { id: 'member-19', name: 'Chaeyoung', color: '#FF5722' },
      { id: 'member-20', name: 'Tzuyu', color: '#607D8B' },
    ],
    lines: [
      { id: 'line-12', memberId: 'member-12', startTime: 10, endTime: 20 },
      { id: 'line-13', memberId: 'member-13', startTime: 25, endTime: 35 },
      { id: 'line-14', memberId: 'member-14', startTime: 40, endTime: 50 },
      { id: 'line-15', memberId: 'member-15', startTime: 55, endTime: 65 },
      { id: 'line-16', memberId: 'member-16', startTime: 70, endTime: 85 },
      { id: 'line-17', memberId: 'member-17', startTime: 90, endTime: 100 },
      { id: 'line-18', memberId: 'member-18', startTime: 105, endTime: 115 },
      { id: 'line-19', memberId: 'member-19', startTime: 120, endTime: 130 },
      { id: 'line-20', memberId: 'member-20', startTime: 135, endTime: 150 },
    ],
  },
}
