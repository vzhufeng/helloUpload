import React, { Component } from "react";
import materialApi from 'js/api/material';
import {Notify} from 'zent';
import fullfillImage from 'zan-utils/fullfillImage';

import "./style.scss";
import Axios from 'axios';

export default class Upload extends Component {
  constructor(prop) {
    super(prop);
  }

  delete = key => {
    const arr = this.props.value;
    arr.splice(key, 1);
    this.props.onChange(arr);
  };

  renderImg(data) {
    const imgBox = (url, key) => (
      <div className="ecloud-comp-upload-preview-item">
        <img
          width={80}
          height={80}
          src={fullfillImage(url)}
          className={"preview-upload-pic"}
        />
        <span className="delete-upload-pic" onClick={() => this.delete(key)}>
          删除图片
        </span>
      </div>
    );

    return data.map((ele, key) => {
      if (toString.call(ele) === "[object Object]") {
        return imgBox(ele.attachment_full_url, key);
      } else if (toString.call(ele) === "[object String]") {
        return imgBox(ele, key);
      }
    });
  }

  uploadFile = e => {
    let { maxSize } = this.props;
    if (!maxSize) {
      maxSize = 3 * 1024 * 1024;
    }
    const { value, onChange, maxAmount = 1 } = this.props;
    const files = e.target.files;

    if(files.length < 1){
      return;
    }

    materialApi.getPublicUploadToken().then(res=>{
      
      const limit = Math.min(maxAmount - value.length, files.length);
      let index = 0;

      const upload = i => {
        const formData = new FormData();
        const file = files[i];
        formData.append("token", res);
        formData.append("file", file);
        Axios({
          baseURL: 'https://upload.qbox.me',
          method: 'post',
          url: '/',
          data: formData
        })
        .then(res2 => {
          const obj = res2.data.data;
          if(obj.attachment_size <= maxSize){
            value.push(res2.data.data);
            onChange(value);
          }else{
            Notify.error(`图片${file.name}大小超过限制`);
          }
        })
        .catch(e=>{
          Notify.error(e)
        }).then(()=>{
          index++;
          if (index < limit) {
            upload(index);
          }
        });
      };

      upload(index);
    }).catch(e=>{
      Notify.error(e)
    });
  };

  render() {
    const { maxAmount = 1, uploadClassName, tipsClassName, accept = "*/*", value, tips } = this.props;
    
    return (
      <React.Fragment>
        <div className={uploadClassName}>
          {value.length > 0 && this.renderImg(value)}
          {value.length < maxAmount && (
            <div
              className="ecloud-comp-upload-upload"
              onClick={e => {
                if (e.target.childNodes && e.target.childNodes.length > 1) {
                  e.target.childNodes[1].value = null;
                  e.target.childNodes[1].click();
                }
              }}
            >
              +
              <input
                width="80"
                height="80"
                type="file"
                multiple={maxAmount > 1}
                accept={accept}
                onChange={this.uploadFile}
              />
            </div>
          )}
        </div>
        <div className={`ecloud-comp-upload-tips ${tipsClassName}`}>
          {tips}
        </div>
      </React.Fragment>
      
    );
  }
}
