import React from 'react';
import {FormControl, Row, Col, Grid} from 'react-bootstrap';
import {connect} from 'react-redux';
import {get} from "lodash";
import {LOCALE_CONFIG_KEY} from "./constant";
import {I18nService} from "./i18n";

class Divider extends React.Component{
    onClick = (e) => {
        if (this.props.onClick)
            this.props.onClick(e);
    };
    render() {
        return (
            <div className="divider" style={{cursor: 'default'}} onClick={this.onClick}>
                <h5>{this.props.text}</h5>
                <hr />
            </div>)
    }
}

const LocaleSelectConfig = connect(() => {
    return (state) => ({
        value: get(state.config, LOCALE_CONFIG_KEY)
    });
})(class localeSelectConfig extends React.Component {
    handleSetLanguage = (e) => {
        const language = e.target.value;
        I18nService.setLocale(language);
    };
    render() {
        const value = this.props.value || I18nService.getLocale();
        return (
            <FormControl componentClass="select" value={value} onChange={this.handleSetLanguage}>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">正體中文</option>
                <option value="ja-JP">日本語</option>
                <option value="en-US">English</option>
            </FormControl>
        )
    }
});


export const settingsClass = () =>
    <div>
        <Row>
            <Col xs={6}>
                <Divider text={window.i18n.setting.__('Language')}/>
            </Col>
            <Col xs={6}>
                <LocaleSelectConfig/>
            </Col>
        </Row>
    </div>
