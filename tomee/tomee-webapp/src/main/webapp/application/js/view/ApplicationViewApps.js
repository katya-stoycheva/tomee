/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

TOMEE.ApplicationViewApps = function (cfg) {
    "use strict";

    var channel = cfg.channel;

    var elMapContent = TOMEE.el.getElMap({
        elName:'main',
        tag:'div',
        attributes:{
            style:'padding-top: 5px; padding-bottom: 5px; padding-left: 5px;'
        },
        children:[
            {
                elName:'left',
                tag:'div',
                attributes:{
                    style:'float:left; width:33%; min-width:170px; margin-right: 5px;'
                }
            },
            {
                elName:'center',
                tag:'div',
                attributes:{
                    style:'float:left; width:66%; min-width:170px;'
                }
            }
        ]
    });

    var deployments = (function () {
        var panel = TOMEE.components.Panel({
            title:TOMEE.I18N.get('application.deployments'),
            avoidOverflow:true
        });


        var table = TOMEE.components.Table({
            channel:channel,
            columns:['appName']
        });

        var map = TOMEE.el.getElMap({
            elName:'main',
            tag:'div',
            attributes:{
                style:'height: 220px;'
            },
            children:[
                table
            ]
        });

        var content = panel.getContentEl();
        content.append(map.main);

        var fileForm = null;
        (function () {
            var fileUploadedHandler = function (event) {
                fileForm.myFrame.unbind('load', fileUploadedHandler);
                var text = TOMEE.utils.getSafe(function () {
                    return fileForm.myFrame.contents().first()[0].body.innerText;
                }, '');

                var json = jQuery.parseJSON(text);

                channel.send('deploy.file.uploaded', json);
            };

            var frameId = TOMEE.Sequence.next('uploadFrame');
            fileForm = TOMEE.el.getElMap({
                elName:'main',
                tag:'form',
                attributes:{
                    style:'background-color:#EEE; border-top: 1px solid #E5E5E5; height: 30px;margin-bottom: 0px;',
                    method:'post',
                    enctype:'multipart/form-data',
                    action:TOMEE.baseURL('upload'),
                    target:frameId
                },
                children:[
                    {
                        elName:'myFrame',
                        tag:'iframe',
                        attributes:{
                            id:frameId,
                            style:'display: none'
                        }
                    },
                    {
                        elName:'fileField',
                        tag:'input',
                        attributes:{
                            style:'padding-left: 5px; float: left; position: relative;',
                            type:'file',
                            name:'file'
                        },
                        listeners:{
                            'change':function (event) {
                                fileForm.myFrame.bind('load', fileUploadedHandler);
                                fileForm.main.submit();
                            }
                        }
                    }
                ]
            });

            content.append(fileForm.main);
        })();

        return {
            getEl:function () {
                return panel.getEl();
            },
            load:function (data) {
                table.load(data, function (bean) {
                    return [bean.name, bean.value];
                });
            },
            setHeight: function(height) {
                panel.setHeight(height);

                var myHeight = panel.getContentEl().height() - TOMEE.el.getBorderSize(panel.getContentEl()) - (2 * TOMEE.el.getBorderSize(fileForm.main))  - fileForm.fileField.height();
                map.main.height(myHeight);
            }
        };
    })();


    var log = (function () {
        var panel = TOMEE.components.Panel({
            title:'-'
        });

        //Log here!
        panel.getContentEl().append('');

        return {
            getEl:function () {
                return panel.getEl();
            },
            setHeight: function(height) {
                panel.setHeight(height);
            }
        };
    })();

    elMapContent['left'].append(deployments.getEl());
    elMapContent['center'].append(log.getEl());

    var setHeight = function (height) {
        var mySize = height - TOMEE.el.getBorderSize(elMapContent.main);
        elMapContent.main.height(mySize);

        var childrenSize = mySize - TOMEE.el.getBorderSize(elMapContent.left);
        elMapContent.left.height(childrenSize);
        elMapContent.center.height(childrenSize);

        deployments.setHeight(childrenSize);
        log.setHeight(childrenSize);


    };

    return {
        getEl:function () {
            return elMapContent.main;
        },
        setHeight:setHeight
    };
};