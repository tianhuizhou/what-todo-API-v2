/*
 * Tag service: define all the services for endpoints
 */
import { BadRequestRestException, NotFoundRestException } from '../../helper/error_exceptions'
const pick = require('lodash/pick')
const TagRepository = require('../repository/tag_repository')
const ProjectService = require('./project_service')
const BoardService = require('./board_service')

class TagService {
  static async getTagList(query?: string) {
    if (query) return await TagRepository.findAllByQuery(query)
    return await TagRepository.findAll()
  }

  static async getTag(id: number) {
    const tag = await TagRepository.findById(id)
    if (!tag) throw new NotFoundRestException('Tag')
    return tag
  }

  static async createTag(dto: { 'name': string; 'theme': string }) {
    const payload = pick(dto, ['name', 'theme'])
    const tag = await TagRepository.create(payload)
    if (!tag) throw new BadRequestRestException('Tag')
    return tag
  }

  static async updateTag(id: number, dto: Partial<{ 'name': string; 'theme': string }>) {
    const payload = pick(dto, ['name', 'theme'])
    const tag = await TagRepository.update(id, payload)
    if (!tag) throw new BadRequestRestException('Tag')

    // Update all the relevant projects
    TagService.updateFirebaseProjectByTag(tag).catch()
    return tag
  }

  static async deleteTag(id: number) {
    const tag = await TagService.getTag(id)
    if (!tag) return

    await TagRepository.delete(id)
    TagService.updateFirebaseProjectByTag(tag).catch()
  }

  private static async updateFirebaseProjectByTag(tag: { tasks: TaskModel[] }) {
    if (tag.tasks.length > 0) {
      const updated_projects = new Set()
      for (const task of tag.tasks) {
        const board = await BoardService.getBoard(task.board_id)
        if (!updated_projects.has(board.project_id)) ProjectService.upsertFirebaseProject(board.project_id).catch()
        updated_projects.add(board.project_id)
      }
    }
  }
}

module.exports = TagService
