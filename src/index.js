import React, { Component } from "react";
import "./style.scss";

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
          src={url}
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
    const files = e.target.files;
    let index = 0;
    const upload = i => {
      const formData = new FormData();
      const file = files[i];
      formData.append("file", file);

      // promise
      const { value, onChange, uploadPromise, maxAmount } = this.props;
      uploadPromise(formData)
        .then(res2 => {
          const arr = value;
          arr.push(res2);
          onChange(arr);
        })
        .catch(e => console.log(e));

      index++;
      if (index < files.length) {
        upload(index);
      }
    };

    upload(index);
  };

  render() {
    const { maxAmount = 1, className, accept = "*/*", value } = this.props;
    let { maxSize } = this.props;
    if (!maxSize) {
      maxSize = 3 * 1024 * 1024;
    }
    return (
      <div className={className}>
        {value.length > 0 && (
          <div className="ecloud-comp-upload-preview">
            {this.renderImg(value)}
          </div>
        )}
        {value.length < maxAmount && (
          <div
            className="ecloud-comp-upload-upload"
            onClick={e => {
              if (e.target.childNodes && e.target.childNodes.length > 1) {
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
    );
  }
}
