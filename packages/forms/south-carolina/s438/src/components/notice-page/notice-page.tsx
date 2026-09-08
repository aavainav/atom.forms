import React from "react";
import { NoticePageModel } from "../../models/notice-page/notice-page";

interface INoticePageProps {
    /** The notice page's current field values. */
    readonly noticePage: NoticePageModel;
}

/** Defines the notice page of the S438 citation form. */
export default function NoticePage(_props: INoticePageProps): React.JSX.Element {
    return (
        <div>
            <div className="border border-dark p-3">
                <h6 className="text-center">NOTICE</h6>
                <p className="text-uppercase">
                    The primary aim of traffic law enforcement is to reduce traffic accidents, injuries and deaths through fair, impartial, and reasonable
                    enforcement of the laws.
                </p>
                <p>
                    You must settle the case hereby made against you in one of the following ways:
                </p>
                <div className="d-flex me-2">
                    <span className="me-3">1)</span>
                    <p>
                        You must appear in court at the appointed time with your south carolina driver's license if indicated in
                        the violation block on the front side of the summons.
                    </p>
                </div>
                <div className="d-flex me-2">
                    <span className="me-3">2)</span>
                    <p>
                        You may post a cash bond with the appropriate trial court prior to the assigned date of trial. If you decide to mail in your bond
                        rather than go to the office, MAIL MONEY ORDER, CASHIER'S CHECK, OR CERTIFIED CHECK DIRECTLY TO THE TRIAL COURT OFFICE BEFORE WHOM
                        YOU ARE SUMMONED TO APPEAR. The trial court name and address shown on the front side of the summons. DO NOT MAIL CASH OR PERSONAL CHECK.
                        Be sure to enclose with the bond the arresting officer's name and the summons number.
                    </p>
                </div>
                <div className="d-flex">
                    <span className="me-3">3)</span>
                    <p>
                        If the court appearance is not mandatory, you may pay your fine online with a credit card for citations issued in participating counties.
                        Go to https://sc.gov/court-payments to determine if online payments are available in the county the citation was issued.
                    </p>
                </div>
                <div className="d-flex me-2">
                    <span className="me-3">4)</span>
                    <p>
                        You may appear in court on the assigned date and time and have a trial conducted by the Trial Judge.
                    </p>
                </div>
                <p className="text-uppercase">
                    The posting of bond before your assigned trial date in no way affects your right to have a fair trial by the judge or, if you make
                    a written request before your scheduled trial by jury.
                </p>
                <p>
                    However, if you are NOT required to appear in court on the assigned trial date and have previously posted bond and do not appear on the trial date,
                    your bond may be forfeited unless the judge has agreed to have your case heard at another time.
                </p>
                <p>
                    If you fail to post bond or personally appear in court on the assigned trial date, you will be tried in your absence and, if convicted, your
                    home state's Motor Vehicle Division will be notified to suspend your license until you have cleared this matter with the trial court.
                    Additionally, a willful failure to appear or post bond is punishable as a separate offense by a fine up to $200.00 or imprisonment for up to 30 days.
                </p>
            </div>
        </div>
    );
}
