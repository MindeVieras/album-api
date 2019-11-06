
import path from 'path'
import AWS from 'aws-sdk'

import { Database } from '../../../db'
import config from '../../../config/config'

let conn = new Database()

const elastictranscoder = new AWS.ElasticTranscoder()

export function generate(s3_key, width, height) {

  return new Promise((resolve, reject) => {

    const hdPerimeter = 1280 + 720
    const fullhdPerimeter = 1920 + 1080
    const videoPerimeter = width + height

    let presets, jobsDone

    conn.query(`SELECT * FROM video_presets`)
      .then(rows => {
        if (rows.length) {

          presets = rows

          if (videoPerimeter < hdPerimeter) {
            return createJobs(['medium'], s3_key, presets)
          }
          else if (videoPerimeter < fullhdPerimeter) {
            return createJobs(['medium', 'hd'], s3_key, presets)
          }
          else {
            return createJobs(['medium', 'hd', 'fullhd'], s3_key, presets)
          }

        }
        else {
          throw 'No video presets found'
        }
      })
      .then(jobs => {
        return readJobs(jobs)
      })
      .then(jobCompleted => {
        jobsDone = jobCompleted

        let response = {
          medium: require('../../../helpers/media').video(s3_key, 'medium'),
          hd: require('../../../helpers/media').video(s3_key, 'hd'),
          thumbs: {
            medium: require('../../../helpers/media').videoThumb(s3_key, 'medium')
          }
        }

        resolve(response)
      })
      .catch(err => {
        reject(err)
      })

  })
}

// Create jobs async loop function
async function createJobs(jobs, s3_key, presets) {

  let responseList = []

  for (let i = 0; i < jobs.length; i++) {

    await new Promise(resolve => {

      let name = jobs[i]
      let preset = findPreset(name, presets)
      let params = createJobParam(s3_key, name, preset.preset_id)

      elastictranscoder.createJob(params, (err, tsData) => {

        if (err)
          console.log(err.stack)

        else {
          responseList.push(tsData)
          resolve()
        }

      })

    })

  }

  return responseList

}

// Create jobs async loop function
async function readJobs(jobs) {

  let responseList = []

  for (let i = 0; i < jobs.length; i++) {

    await new Promise(resolve => {

      const { Id } = jobs[i].Job

      // Status values: Submitted, Progressing, Complete, Canceled, or Error.

      let params = { Id }

      const readJobInterval = setInterval(() => {

        elastictranscoder.readJob(params, (err, jobData) => {

          if (err) {
            clearInterval(readJobInterval)
            console.log(err.stack)
          }

          else {

            const { Status } = jobData.Job

            if (Status === 'Complete' || Status === 'Canceled' || Status === 'Error') {
              clearInterval(readJobInterval)
              responseList.push(jobData)
              resolve()
            }
          }

        })

      }, 500)

    })

  }

  return responseList

}

// Find preset in presets array
function findPreset(name, presets) {

  let param

  presets.map(p => {
    if (p.name === name) {
      param = p
    }
  })

  return param
}

// Creates parameter object for TS
function createJobParam(s3_key, name, preset_id) {

  let ext = path.extname(s3_key)
  let thumbPath = 'videos/thumbs/' + name + '/' + path.basename(s3_key, ext) + '-'

  let params = {
    PipelineId: config.aws.transcoderPipeline,
    Input: {
      AspectRatio: 'auto',
      Container: 'auto',
      FrameRate: 'auto',
      Interlaced: 'auto',
      Key: s3_key,
      Resolution: 'auto',
    },
    Output: {
      Key: 'videos/' + name + '/' + path.basename(s3_key),
      PresetId: preset_id,
      Rotate: 'auto',
      ThumbnailPattern: thumbPath + '{count}'
    }
  }

  return params
}
