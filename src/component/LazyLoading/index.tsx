import React, { Component, Suspense, lazy,useEffect,useCallback, useState } from 'react';
import {Spin} from 'antd';
import './index.scss';

function Index(props: any) {
    return (
        <div className="page-loading-mask" style={{ height: '100vh' }}>
            <Spin size="large" />
        </div>
    );
}

export default Index;