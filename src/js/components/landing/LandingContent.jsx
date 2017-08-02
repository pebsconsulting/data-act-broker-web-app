/**
* LandingContent.jsx
* Created by Kyle Fox 2/19/16
**/

import React from 'react';
import RecentActivityTable from './recentActivity/RecentActivityTable.jsx';
import LandingRequirementsModal from './blocks/LandingRequirementsModal.jsx';
import BlockContent from './BlockContent.jsx';

import * as Icons from '../SharedComponents/icons/Icons.jsx';
import Banner from '../SharedComponents/Banner.jsx';
import * as permissionHelper from '../../helpers/permissionsHelper.js';

import * as ReviewHelper from '../../helpers/reviewHelper.js';

const defaultProps = {
    session: {
        user: {
            agency_name: "Your Agency"
        }
    }
};

export default class LandingContent extends React.Component {
    constructor(props) {
        super(props);

        this.didUnmount = false;

        this.state = {
            expanded: false,
            type: this.props.type,
            window: null
        };
    }

    componentDidMount() {
        this.didUnmount = false;
    }

    componentWillReceiveProps(nextProps) {
        let type = null;

        if(this.state.type !== nextProps.type){
            type = nextProps.type;
        }
        if(type && type != this.state.type) {
            this.setState({
                'type': type
            })
        }
    }

    clickedUploadReqs(e) {
        e.preventDefault();

        this.refs.modal.openModal();
    }

    toggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        })
    }

    render() {
        const affiliations = this.props.session.user.affiliations;

        //Size to set off the limiting of the recent activity
        const limit=3;

        let agencyName = 'Your Agency';
        if (affiliations && affiliations.length > limit && !this.state.expanded) {
            agencyName = affiliations.slice(0, limit).map((a) => a.agency_name).join(', ') + "...";
        }
        else if (affiliations && affiliations.length > 0) {
            agencyName = affiliations.map((a) => a.agency_name).join(', ');
        }

        let recentHeader = 'recent-activity-header';
        let recentActivity = 'recent-activity';
        let expand = 'hide block';
        let expandContent = '';

        if (affiliations && affiliations.length > limit && !this.state.expanded) {
            recentHeader +='-hidden';
            recentActivity +='-hidden';
            expand = 'expand-button block'
            expandContent = 'Show More';
        }
        else if (affiliations && affiliations.length > limit && this.state.expanded) {
            expand = 'expand-button block'
            expandContent = 'Show Less';
        }

        let header = "Welcome to the DATA Act Broker";
        let headerBody = <div></div>;
        let headerClass = 'dark';
        if (this.state.type == 'fabs') {
            header = "Financial Assistance Broker Submission (FABS)";
            headerClass = 'teal'
        }
        if (this.state.type == 'dabs') {
            header = "DATA Act Broker Submission (DABS)";
            headerBody = <div>
                            <p>Upload your agency’s files and validate them against the latest version of the DATA Act Information Model Schema (DAIMS).</p>
                            <p>Details on how to format your data, including required and optional fields, can be found in the <a href="https://broker.usaspending.gov/#/resources" target="_blank" rel="noopener noreferrer" >Resources section.</a>.</p>
                        </div>;
        }

        let blockContent = <BlockContent type={this.state.type} clickedUploadReqs={this.clickedUploadReqs.bind(this)} session={this.props.session}/>

        let recentActivityTable = null;
        if (this.state.type !== 'home'){
            recentActivityTable = <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <h2 className={recentHeader}>
                                    <div className="recent-header">Recent Activity for:</div>
                                    <div className={recentActivity}>{agencyName}</div>
                                </h2>
                                <div className='see-more-wrapper'>
                                    <a className={expand} onClick={this.toggleExpand.bind(this)}>{expandContent}</a>
                                </div>
                                <RecentActivityTable {...this.props} />
                            </div>
                        </div>
                    </div>;;
        }

        return (
                <div className="site_content">
                    <div className={"usa-da-content-"+headerClass}>
                        <div className="container">
                            <div className="row usa-da-content-landing usa-da-page-title">
                                <div className="col-md-8 mt-40 mb-50">
                                    <h1 className="display-2" data-contentstart="start" tabIndex={-1}>{header}</h1>
                                    {headerBody}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Banner type={this.state.type} />
                    <div className="container mb-60">
                        <div className="row">
                            <div className="usa-da-landing col-md-12">
                                <div className="usa-da-landing-btns">
                                    {blockContent}
                                    <div id="modalHolder">
                                        <LandingRequirementsModal ref="modal" type={this.props.type}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {recentActivityTable}
                </div>
            );
        }
    }

LandingContent.defaultProps = defaultProps;
