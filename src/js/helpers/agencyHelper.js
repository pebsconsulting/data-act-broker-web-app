import Q from 'q';
import Request from './sessionSuperagent';

import { kGlobalConstants } from '../GlobalConstants';

export const fetchAgencies = () => {
    const deferred = Q.defer();

    Request.get(kGlobalConstants.API + 'list_agencies/')
        .send()
        .end((err, res) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.body.cgac_agency_list.concat(res.body.frec_agency_list));
            }
        });

    return deferred.promise;
};

export const fetchAllAgencies = () => {
    const deferred = Q.defer();

    Request.get(kGlobalConstants.API + 'list_all_agencies/')
        .send()
        .end((err, res) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.body.agency_list.concat(res.body.shared_agency_list));
            }
        });

    return deferred.promise;
};

export const fetchSubTierAgencies = () => {
    const deferred = Q.defer();

    Request.get(kGlobalConstants.API + 'list_sub_tier_agencies/')
        .send()
        .end((err, res) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.body.sub_tier_agency_list);
            }
        });

    return deferred.promise;
};

export function checkYearQuarter(cgac, frec, year, quarter) {
    const deferred = Q.defer();
    const validCgac = cgac ? cgac : '';
    const validFrec = frec ? frec : '';
    Request.get(kGlobalConstants.API + `check_year_quarter/?cgac_code=${validCgac}&frec_code=${validFrec}&` +
                `reporting_fiscal_year=${year}&reporting_fiscal_period=${quarter}`)
        .end((err, res) => {
            if (err) {
                const response = Object.assign({}, res.body);
                response.httpStatus = res.status;
                deferred.reject(response);
            }
            else {
                deferred.resolve(res);
            }
        });

    return deferred.promise;
}
