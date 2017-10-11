/**
  * DashboardTable.jsx
  * Created by Kevin Li 10/28/16
  **/

import React from 'react';
import Reactable from 'reactable';
import _ from 'lodash';

import FormattedTable from '../SharedComponents/table/FormattedTable.jsx';
import SubmissionLink from '../landing/recentActivity/SubmissionLink.jsx';
import HistoryLink from './HistoryLink.jsx';
import * as Status from '../landing/recentActivity//SubmissionStatus.jsx';
import * as LoginHelper from '../../helpers/loginHelper.js';
import * as PermissionsHelper from '../../helpers/permissionsHelper.js';
import DeleteLink from '../landing/recentActivity/DeleteLink.jsx';

import DashboardPaginator from './DashboardPaginator.jsx';

const defaultProps = {
    data: [],
    isLoading: true
};

export default class DashboardTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            parsedData: [],
            cellClasses: [],
            headerClasses: [],
            message: 'Loading submissions...',
            currentPage: 1,
            totalPages: 1,
            account: null,
            deleteIndex: -1,
            sortColumn: 0,
            sortDirection: 'desc',
            user: true,
            type: this.props.type
        }
    };

    componentDidMount() {
        this.props.loadTableData(this.state.currentPage, this.props.isCertified, this.getCategory(), this.state.sortDirection, this.props.type=='fabs');
        this.loadUser();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevProps.data, this.props.data)) {
            this.buildRow();
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.type != this.state.type) {
            this.reload()
            this.setState({type:nextProps.type})
        }
    }

    loadUser(){
        LoginHelper.fetchActiveUser().then((user)=>{
            this.setState({account: user});
        })
    }

    getHeaders() {
        let headers = [];
        if (this.props.isCertified) {
            if (this.state.type === 'fabs') {
                headers = [
                    'Submission ID',
                    'Agency: Filename',
                    'Created By',
                    'Action Date Range',
                    'Published By',
                    'Published On'
                ];
            }
            else {
                headers = [
                    'Reporting Period',
                    'Agency',
                    'Created By',
                    'Last Modified',
                    'Status',
                    'Certified By',
                    'Certified On',
                    'History'
                ];
            }
        }
        else {
            let dateName = '';
            let canDelete = false;
            let agency = '';
            let view = 'View'
            if (this.state.type === 'fabs') {
                dateName = 'Action Date Range';
                canDelete = PermissionsHelper.checkFabsPermissions(this.props.session);
                agency = 'Agency:Filename'
                view = 'Submission ID'
            }
            else {
                dateName = 'Reporting Period';
                canDelete = PermissionsHelper.checkPermissions(this.props.session);
                agency = 'Agency'
            }
            headers = [
                view,
                agency,
                dateName,
                'Created By',
                'Last Modified',
                'Status'
            ];
            if (canDelete) {
                headers = headers.concat('Delete');
            }
        }
        return headers;
    }

    changePage(newPage) {
        this.setState({
            currentPage: newPage,
        }, () => {
            this.props.loadTableData(this.state.currentPage, this.props.isCertified, this.getCategory(), this.state.sortDirection);
        });
    }

    reload(){
        this.props.loadTableData(this.state.currentPage, this.props.isCertified, this.getCategory(), this.state.sortDirection);
        this.buildRow();
    }

    deleteWarning(index){
        this.setState({
            deleteIndex: index
        }, () =>{
            this.buildRow()
        })
    }

    sortTable(direction, column) {
        // the table sorting changed
        this.setState({
            sortDirection: direction,
            sortColumn: column
        }, () => {
            // re-display the data
            this.props.loadTableData(this.state.currentPage, this.props.isCertified, this.getCategory(), this.state.sortDirection);
            this.buildRow();
        });
    }

    getCategory(){
        if(this.props.isCertified) {
            switch(this.state.sortColumn){
                case 1:
                    return 'agency';
                    break;
                case 2:
                    return 'submitted_by';
                    break;
                case 3:
                    return 'modified';
                    break;
                case 5:
                    return 'modified';
                    break;
                default:
                    return 'modified';
            }
        }
        switch(this.state.sortColumn){
            case 1:
                return 'agency';
                break;
            case 2:
                return 'reporting';
                break;
            case 3:
                return 'submitted_by';
                break;
            default:
                return 'modified';
        }
    }

    convertToLocalDate(dateToConvert) {
        // convert date to local date, need to replace the space with a T for Date() formatting
		// Add a Z to the end to imply the date is in UTC
		dateToConvert = dateToConvert.replace(" ", "T") + "Z";
		const tmpDate = new Date(dateToConvert);
        
		// format date as YYYY-MM-DD
		const year = tmpDate.getFullYear()
		let month = tmpDate.getMonth() + 1;
		if(month < 10){
			month = "0" + month;
		}
		let day = tmpDate.getDate();
		if (day < 10){
			day = "0" + day;
		}
		return year + "-" + month + "-" + day;
    }

    formatRow(item, index) {
        let start = "Start: ";
        let end = "\nEnd: ";
        if (this.state.type == 'fabs') {
            start = "Earliest: ";
            end = "\nLatest: "
        }
        let reportingDateString = start + item.reporting_start_date + end + item.reporting_end_date;
        if (!item.reporting_start_date || !item.reporting_end_date) {
            reportingDateString = 'No reporting period\nspecified';
        }

        let userName = item.hasOwnProperty('user') ? item.user.name : '--';

        let deleteConfirm = this.state.deleteIndex !== -1 && index === this.state.deleteIndex;

        let link = <SubmissionLink submissionId={item.submission_id} type={this.state.type}/>;

        if (this.props.isCertified) {
            link = <SubmissionLink submissionId={item.submission_id} value={reportingDateString} type={this.state.type}/>;
        }

        let row = [];
        if (this.props.isCertified) {
            // Certified Submissions table
            row = [
                link,
                this.getAgency(item),
                userName
            ];

            let certified_on = item.certified_on !== "" ? this.convertToLocalDate(item.certified_on) : item.certified_on;
            if (this.props.type === 'fabs') {
                row = row.concat([
                    reportingDateString,
                    item.certifying_user,
                    certified_on
                ]);
            }
            else {
                row = row.concat([
                    this.convertToLocalDate(item.last_modified),
                    <Status.SubmissionStatus status={item.rowStatus} certified={this.props.isCertified} />,
                    item.certifying_user,
                    certified_on,
                    <HistoryLink submissionId={item.submission_id} />
                ]);
            }
        }
        else {
            // Active Submissions table
            row = [
                link,
                this.getAgency(item),
                reportingDateString,
                userName,
                this.convertToLocalDate(item.last_modified),
                <Status.SubmissionStatus status={item.rowStatus} certified={this.props.isCertified} />
            ];

            let deleteCol = false;
            let canDelete = false;
            if (this.props.type === 'fabs') {
                deleteCol = PermissionsHelper.checkFabsPermissions(this.props.session);
                canDelete = PermissionsHelper.checkFabsAgencyPermissions(this.props.session, item.agency);
            }
            else {
                deleteCol = PermissionsHelper.checkPermissions(this.props.session);
                canDelete = PermissionsHelper.checkAgencyPermissions(this.props.session, item.agency);
            }

            if (deleteCol) {
                if (canDelete && item.publish_status === 'unpublished') {
                    row.push(<DeleteLink submissionId={item.submission_id} index={index} warning={this.deleteWarning.bind(this)} confirm={deleteConfirm} reload={this.reload.bind(this)} item={item} account={this.state.account}/>);
                }
                else {
                    row.push('N/A');
                }
            }
        }
        return row;
    }

    buildRow() {
        // iterate through the recent activity
        const output = [];
        const rowClasses = [];
        let progress_size = this.props.type == 'fabs' ? 15 : 20;
        let view_size = this.props.type == 'fabs' ? 15 : 10;
        let classes = ['row-10 text-center', 'row-20 text-center', 'row-15 text-right white-space', 'row-15 text-right', 'row-10 text-right','row-' + progress_size + ' text-right progress-cell', 'row-10 text-center'];

        if (this.props.isCertified) {
            classes = ['row-' + view_size + ' text-center', 'row-20 text-right white-space', 'row-12_5 text-right', 'row-10 text-right','row-20 text-right progress-cell', 'row-10 text-center', 'row-10 text-center', 'row-10 text-center'];
            if(this.state.type == 'fabs') {
                classes = ['row-10 text-center', 'row-25 text-right', 'row-10 text-right', 'row-15 text-right white-space','row-10 text-right', 'row-10 text-center'];
            }
            
        }

        // iterate through each item returned from the API
        this.props.data.forEach((item, index) => {
            // break the object out into an array for the table component
            let row = this.formatRow(item, index);

            rowClasses.push(classes);
            output.push(row);
        });

        const headerClasses = classes;

        let message = '';
        if (this.props.data.length == 0) {
            message = 'No submissions to list';
        }

        this.setState({
            parsedData: output,
            cellClasses: rowClasses,
            headerClasses: headerClasses,
            message: message,
            totalPages: Math.ceil(this.props.total / 10)
        });
    }

    getAgency(item) {
        let agency = item.agency
        if (this.props.type === 'fabs') {
            return agency += ":\n" + item.files[0].split('/').pop().replace(/^[0-9]*_/,"")
        }
        return agency
    }

    render() {
        let paginator;

        if (this.state.totalPages > 1) {
            paginator = <DashboardPaginator
                current={this.state.currentPage}
                total={this.state.totalPages}
                changePage={this.changePage.bind(this)} />;
        }

        let loadingClass = '';
        if (this.props.isLoading) {
            loadingClass = ' loading';
        }

        let headers = this.getHeaders();

        //cannot be added to the const because if a user is read only then delete will not be created
        let unsortable = [0, 2, 5, 6];
        if(this.props.isCertified && this.state.type == 'fabs'){
            unsortable = [0, 3, 4];
        }
        else if(this.props.isCertified) {
        	unsortable = [0, 4, 5, 6, 7];
        }

        return (
            <div className="usa-da-submission-list">
                <div className={"submission-table-content" + loadingClass}>
                    <FormattedTable headers={headers} data={this.state.parsedData} sortable={true} cellClasses={this.state.cellClasses} unsortable={unsortable} headerClasses={this.state.headerClasses} onSort={this.sortTable.bind(this)} />
                </div>
                <div className="text-center">
                    {this.state.message}
                </div>
                <div className="paginator-wrap">
                    {paginator}
                </div>
            </div>
        );
    }
}

DashboardTable.defaultProps = defaultProps;