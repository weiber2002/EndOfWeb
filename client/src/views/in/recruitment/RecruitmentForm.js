/* eslint-disable prettier/prettier */
import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router'
import JoditEditor from 'jodit-react'
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormControl,
  CInputGroup,
  CInputGroupText,
  CRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import CareerPreview from '../career/CareerPreview'
const CareerForm = ({ data }) => {
  const add = data ? false : true
  const formTemplate = add
    ? {
        title: '',
        companyName: '',
        workType: '',
        salary: '',
        diploma: '',
        description: '',
        file: '',
      }
    : {
        title: data.title.title,
        companyName: data.title.company_name,
        workType: data.title.work_type,
        salary: data.info.salary,
        diploma: data.info.diploma,
        description: data.spec.description,
        file: data.image,
        _id: data._id,
      }
  const history = useHistory()
  const editor = useRef(null)
  const [isModal, setIsModal] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [previewURL, setPreviewURL] = useState(null)
  const [experience, setExperience] = useState(add ? [''] : data.info.experience)
  const [requirement, setRequirement] = useState(add ? [''] : data.spec.requirement)
  const [fileButton, setFileButton] = useState(null)
  const [dataForm, setDataForm] = useState(formTemplate)
  const config = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/
  }
  const handleInputChange = (e) => {
    console.log('value changed', e.target.value)
    setDataForm({ ...dataForm, [e.target.name]: e.target.value })
  }
  const addArray = (e) => {
    if (e.target.name === 'experience') {
      const newArray = experience.concat([''])
      setExperience(newArray)
    } else if (e.target.name === 'requirement') {
      const newArray = requirement.concat([''])
      setRequirement(newArray)
    }
  }
  const handleInputArray = (e, index) => {
    if (e.target.name === 'experience') {
      const newArray = experience.map((exp, idx) => {
        if (idx !== index) return exp
        else return e.target.value
      })
      setExperience(newArray)
    } else if (e.target.name === 'requirement') {
      const newArray = requirement.map((req, idx) => {
        if (idx !== index) return req
        else return e.target.value
      })
      setRequirement(newArray)
    }
  }
  const handleDeleteArray = (e, index) => {
    if (e.target.name === 'experience') {
      const newArray = experience.filter((exp, idx) => idx !== index)
      setExperience(newArray)
    } else if (e.target.name === 'requirement') {
      const newArray = requirement.filter((req, idx) => idx !== index)
      setRequirement(newArray)
    }
  }
  const handleChangeImage = (e) => {
    let reader = new FileReader()
    let file = e.target.files[0]
    setFileButton(e.target)
    setDataForm({ ...dataForm, file: file })
    reader.onloadend = () => {
      setPreviewURL(reader.result)
    }
    reader.readAsDataURL(file)
    // call the modal
    setIsModal(true)
  }

  const clearImage = (e) => {
    setIsModal(false)
    setPreviewURL(null)
    setDataForm({ ...dataForm, file: null })
    fileButton.value = ''
  }
  const handleSubmit = () => {
    const data = new FormData()
    data.append('title', dataForm.title)
    data.append('company_name', dataForm.companyName)
    data.append('work_type', dataForm.workType)
    data.append('salary', dataForm.salary)
    data.append('diploma', dataForm.diploma)
    data.append('description', dataForm.description)
    for (let exp of experience) {
      data.append('experience[]', exp)
    }
    for (let req of requirement) {
      data.append('requirement[]', req)
    }
    if (previewURL) {
      data.append('file', dataForm.file)
    }
    const config = {
      headers: { 'content-type': 'multipart/form-data' },
    }
    if (add) {
      console.log('in add recruitment', data)
      axios
        .post('/api/addRecruitment', data, config)
        .then(() => {
          alert('已新增')
          history.push('/own_recruitment')
        })
        .catch((err) => {
          err.response.data.description && alert('錯誤\n' + err.response.data.description)
        })
    } else if (!add) {
      data.append('_id', dataForm._id)
      console.log('in edit recruitment', data)
      axios
        .patch('/api/recruitment', data, config)
        .then(() => {
          alert('已更新')
          history.push('/own_recruitment')
        })
        .catch((err) => {
          err.response.data.description && alert('錯誤\n' + err.response.data.description)
        })
    }
  }
  return (
    <>
      <CModal visible={isModal} onDismiss={() => setIsModal(false)} alignment="center">
        <CModalHeader onDismiss={() => setIsModal(false)}>
          <CModalTitle>Preview Your Photo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <img src={previewURL} className="img-fluid container justify-content-center d-flex" />
        </CModalBody>
        <CModalFooter>
          <CButton color="warning" onClick={clearImage}>
            Clear
          </CButton>
          <CButton color="dark" onClick={() => setIsModal(false)}>
            OK
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={blockModal} onDismiss={() => setBlockModal(false)} alignment="center">
        <CModalHeader onDismiss={() => setBlockModal(false)}>
          <CModalTitle>Preview New Post</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CareerPreview post={dataForm} experience={experience} requirement={requirement} />
        </CModalBody>
        <CModalFooter>
          <CButton color="warning" onClick={() => setBlockModal(false)}>
            Back
          </CButton>
          <CButton color="dark" onClick={handleSubmit}>
            OK
          </CButton>
        </CModalFooter>
      </CModal>
      <div className="d-flex flex-row align-items-center text-color-black">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md="11" lg="9" xl="8">
              <CCard className="mx-4">
                <CCardBody className="p-4">
                  <CForm>
                    <h1>{add ? 'Ready to post' : 'Want to edit'} a recruitment?</h1>
                    <p className="text-medium-emphasis">
                      {add ? 'Create' : 'Edit'} your recruitment
                    </p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon name="cil-layers" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="title"
                        data-tip="Use impressing title to get people's attention!"
                        placeholder="The job title"
                        value={dataForm.title}
                        name="title"
                        onChange={handleInputChange}
                      />
                      <ReactTooltip id="title" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon name="cil-building" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="companyName"
                        data-tip="Enter your company's name"
                        placeholder="Company name"
                        value={dataForm.companyName}
                        name="companyName"
                        onChange={handleInputChange}
                      />
                      <ReactTooltip id="companyName" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon name="cil-braille" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="workType"
                        data-tip="The position you are recruiting"
                        placeholder="Work Type"
                        value={dataForm.workType}
                        name="workType"
                        onChange={handleInputChange}
                      />
                      <ReactTooltip id="workType" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon name="cil-dollar" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="salary"
                        data-tip="Salary paid (/month or /year)"
                        placeholder="Salary"
                        name="salary"
                        value={dataForm.salary}
                        onChange={handleInputChange}
                      />
                      <ReactTooltip id="salary" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon name="cil-education" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="diploma"
                        data-tip="Prefered education degree or major"
                        placeholder="Diploma"
                        value={dataForm.diploma}
                        name="diploma"
                        onChange={handleInputChange}
                      />
                      <ReactTooltip id="diploma" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    {experience.map((exp, index) => {
                      return (
                        <CInputGroup className="mb-3" key={index}>
                          <CInputGroupText>
                            <CIcon name="cil-address-book" />
                          </CInputGroupText>
                          <CFormControl
                            data-for="experience"
                            data-tip="Prefered experience"
                            placeholder="Required Experience"
                            name="experience"
                            value={exp}
                            onChange={(e) => handleInputArray(e, index)}
                          />
                          <ReactTooltip id="experience" place="top" type="dark" effect="solid" />
                          <CButton
                            type="button"
                            name="experience"
                            onClick={(e) => handleDeleteArray(e, index)}
                          >
                            x
                          </CButton>
                        </CInputGroup>
                      )
                    })}
                    {requirement.map((req, index) => {
                      return (
                        <CInputGroup className="mb-3" key={index}>
                          <CInputGroupText>
                            <CIcon name="cil-thumb-up" />
                          </CInputGroupText>
                          <CFormControl
                            data-for="requirement"
                            data-tip="Any requirement for this job"
                            placeholder="Required skills"
                            name="requirement"
                            value={req}
                            onChange={(e) => handleInputArray(e, index)}
                          />
                          <ReactTooltip id="requirement" place="top" type="dark" effect="solid" />
                          <CButton
                            type="button"
                            name="requirement"
                            onClick={(e) => handleDeleteArray(e, index)}
                          >
                            x
                          </CButton>
                        </CInputGroup>
                      )
                    })}
                    <div
                      className="mb-3 mw-100"
                      data-for="description"
                      data-tip="Some description for this job"
                    >
                      <JoditEditor
                        name="description"
                        ref={editor}
                        value={dataForm.description}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={(newContent) =>
                          setDataForm({ ...dataForm, description: newContent })
                        } // preferred to use only this option to update the content for performance reasons
                      />
                      <ReactTooltip id="description" place="top" type="dark" effect="solid" />
                    </div>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon name="cil-image" />
                      </CInputGroupText>
                      <CFormControl
                        data-for="image"
                        data-tip="Put your company's brand!"
                        id="formFile"
                        type="file"
                        onChange={handleChangeImage}
                      ></CFormControl>
                      <ReactTooltip id="image" place="top" type="dark" effect="solid" />
                    </CInputGroup>
                    <CRow className="mt-3">
                      <CCol xs={6} className="d-flex justify-content-center">
                        <CButton type="button" name="experience" onClick={addArray}>
                          Add required experience
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="d-flex justify-content-center">
                        <CButton type="button" name="requirement" onClick={addArray}>
                          Add required skills
                        </CButton>
                      </CCol>
                    </CRow>
                    <CRow className="justify-content-center mt-3">
                      <div className="d-flex d-flex justify-content-center">
                        <CButton color="dark" onClick={() => setBlockModal(true)}>
                          Done
                        </CButton>
                      </div>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  )
}
CareerForm.propTypes = {
  data: PropTypes.object,
}
export default CareerForm