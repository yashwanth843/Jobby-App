import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Cookies from 'js-cookie'
import JobCard from '../JobCard'
import JobsFilterGroup from '../JobsFilterGroup'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const locations = [
  {locationId: 'HYDERABAD', location: 'Hyderabad'},

  {locationId: 'BANGALORE', location: 'Bangalore'},

  {locationId: 'CHENNAI', location: 'Chennai'},

  {locationId: 'DELHI', location: 'Delhi'},

  {locationId: 'MUMBAI', location: 'Mumbai'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'INPROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class JobProfileSection extends Component {
  state = {
    jobsList: [],
    searchInput: '',
    employmentType: [],
    salaryRange: 0,
    apiStatus: apiStatusConstants.initial,
    locate: [],
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })

    const jwtToken = Cookies.get('jwt_token')
    const {salaryRange, employmentType, searchInput, locate} = this.state
    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentType.join()}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedData = data.jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      let filteredData = updatedData
      if (locate.length !== 0) {
        filteredData = updatedData.filter(job => {
          let isLocationIncluded = false
          locate.forEach(location => {
            if (job.location === location) {
              isLocationIncluded = true
            }
            return isLocationIncluded
          })
          return isLocationIncluded
        })
      }
      this.setState({
        jobsList: filteredData,
        apiStatus: apiStatusConstants.success,
        searchInput: '',
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  changeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onChangeLocation = location => {
    const {locate} = this.state
    this.setState({locate: [...locate, location]}, this.getJobDetails)
    console.log(location)
  }

  onKeyDown = event => {
    if (event.key === 'Enter') {
      this.getJobDetails()
    }
  }

  changeSalaryRange = salary => {
    this.setState({salaryRange: salary}, this.getJobDetails)
  }

  changeEmploymentType = type => {
    this.setState(
      prev => ({employmentType: [...prev.employmentType, type]}),
      this.getJobDetails,
    )
  }

  onClickRetryButton = () => {
    this.getJobDetails()
  }

  onClickSearchButton = () => {
    this.getJobDetails()
  }

  renderJobDetails = () => {
    const {jobsList} = this.state
    const jobsDisplay = jobsList.length > 0

    return jobsDisplay ? (
      <div className="details-container">
        <ul className="job-details-item-container">
          {jobsList.map(eachData => (
            <JobCard key={eachData.id} jobDetails={eachData} />
          ))}
        </ul>
      </div>
    ) : (
      <div className="no-jobs-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
          className="no-jobs"
        />
        <h1 className="no-jobs-heading">No Jobs Found</h1>
        <p className="no-jobs-desc">
          We could not find any jobs. Try other filters.
        </p>
        <button
          type="button"
          data-testid="retry"
          onClick={this.onClickRetryButton}
          className="retryButton"
        >
          Retry
        </button>
      </div>
    )
  }

  renderFailureView = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-view"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-desc">
        we cannot seem to find the page you are looking for
      </p>
      <button
        type="button"
        data-testid="button"
        className="jobs-failure-button"
        onClick={this.getJobDetails}
      >
        Retry
      </button>
    </div>
  )

  renderLoadingView = () => (
    <div className="profile-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobProfileDetailsList = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetails()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    const {searchInput, jobsList} = this.state
    const result = jobsList.map(each => each.location)
    console.log(result)
    return (
      <div className="job-details-container">
        <div className="render-group-items">
          <JobsFilterGroup
            employmentTypesList={employmentTypesList}
            salaryRangesList={salaryRangesList}
            changeEmploymentType={this.changeEmploymentType}
            changeSalaryRange={this.changeSalaryRange}
            searchInput={searchInput}
            changeSearchInput={this.changeSearchInput}
            getJobDetails={this.getJobDetails}
            jobsList={this.jobsList}
            onChangeJobs={locations}
            onChangePlace={this.onChangeLocation}
          />
        </div>
        <div className="responsive-items">
          <div className="search-input">
            <input
              type="search"
              className="search"
              placeholder="Search"
              value={searchInput}
              onChange={this.changeSearchInput}
              onKeyDown={this.onKeyDown}
            />
            <button
              type="button"
              data-testid="searchButton"
              className="search-button"
              onClick={this.onClickSearchButton}
            >
              <BsSearch className="search-icon" />
            </button>
          </div>
          {this.renderJobProfileDetailsList()}
        </div>
      </div>
    )
  }
}

export default JobProfileSection
