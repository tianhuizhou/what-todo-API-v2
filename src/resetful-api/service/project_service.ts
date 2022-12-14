/*
 * Project service: define all the services for endpoints
 */
import { BadRequestRestException, NotFoundRestException } from '../../helper/error_exceptions'
const ProjectRepository = require('../repository/project_repository')
const pick = require('lodash/pick')
const firestore = require('firebase-admin').firestore()

class ProjectService {
  static async getProjectList(user_uid: string) {
    const project_list = await ProjectRepository.findAll()
    // only return public and the private projects that belong to the user
    return project_list.filter(
      (item: any) => item.visibility === 'public' || (item.visibility === 'private' && item.owner_uid === user_uid),
    )
  }

  static async getProject(id: number) {
    const project = await ProjectRepository.findById(id)
    if (!project) throw new NotFoundRestException('Project')
    ProjectService.upsertFirebaseProject(project.id).catch()
    return project
  }

  static async createProject(
    dto: {
      name: string
      visibility: string
      description: string
      favorite: boolean
      background: string
    },
    user_uid: string,
  ) {
    const payload = pick(dto, ['name', 'visibility', 'description', 'favorite', 'background'])
    payload.owner_uid = user_uid
    const project = await ProjectRepository.create(payload)
    if (!project) throw new BadRequestRestException('Project')
    ProjectService.upsertFirebaseProject(project.id).catch()
    return project
  }

  static async updateProject(
    id: number,
    dto: Partial<{
      name: string
      visibility: string
      description: string
      favorite: boolean
      board_order: number[]
      background: string
    }>,
  ) {
    const payload = pick(dto, ['name', 'visibility', 'description', 'favorite', 'board_order', 'background'])
    const project = await ProjectRepository.update(id, payload)
    if (!project) throw new BadRequestRestException('Project')
    ProjectService.upsertFirebaseProject(project.id).catch()
    return project
  }

  static async deleteProject(id: number) {
    const project = await ProjectService.getProject(id)
    if (project.session_uid) ProjectService.deleteFirebaseProject(project.session_uid).catch()
    await ProjectRepository.delete(project.id)
  }

  static async upsertFirebaseProject(id: number) {
    const project = await ProjectService.getProject(id)

    for (let board of project.boards) board = ProjectService.sortDataByOrder(board.tasks, board.task_order)
    project.boards = ProjectService.sortDataByOrder(project.boards, project.board_order)

    return firestore.collection('projects').doc(project.session_uid).set(project)
  }

  static async deleteFirebaseProject(session_uid: string) {
    return firestore.collection('projects').doc(session_uid).delete()
  }

  private static sortDataByOrder(target: [BoardModel | TaskModel], order: number[]) {
    const sort_list = []
    const item_ref = new Map()
    for (const item of target) item_ref.set(item.id, item)
    for (const pos of order) sort_list.push(item_ref.get(pos))
    return sort_list
  }
}

module.exports = ProjectService
