import React, { useEffect } from "react";
import { Form, Row, Col, Tag, Input, Select, FormInstance } from "antd";
import { useImmer } from "use-immer";
import Axios from "axios";
import { CITY_CODE_URL } from "consts";
import { LabeledValue } from "antd/lib/select";
import {
  StandardPropertyDTOValueTypeEnum,
  Project,
  ProjectVO,
} from "api/generated/model";

interface CodeNode {
  code: string;
  name: string;
}

interface SelectAddressProps {
  form?: FormInstance;
  defaultInfo: any;
  violationFields?: Array<string>;
  setViolation?: (violationFields: string[]) => void;
}

interface State {
  provinceData: CodeNode[];
  cityData: CodeNode[];
  countyData: CodeNode[];
  streetData: CodeNode[];
}

const requestData = (code: number | string) => {
  if (code && code.toString()) {
    return Axios.create()
      .get(`${CITY_CODE_URL}/${code.toString()}.json`)
      .then((res) => res?.data.children ?? [])
      .catch((err) => {
        console.log(err);
        return [];
      });
  }
  return Promise.resolve([]);
};

export default function SelectAddress(props: SelectAddressProps) {
  const { form, defaultInfo, violationFields, setViolation } = props;
  const [
    { provinceData, cityData, countyData, streetData },
    updateState,
  ] = useImmer<State>({
    provinceData: [],
    cityData: [],
    streetData: [],
    countyData: [],
  });

  const updateArr = (
    field: "province" | "city" | "county",
    value: number | string,
    resetRelatedValue = true,
  ) => {
    if (field === "province") {
      requestData(value).then((arr) => {
        updateState((draft) => {
          draft.cityData = arr;
          draft.countyData = [];
          draft.streetData = [];
        });
      });
      if (resetRelatedValue) {
        form?.setFieldsValue({
          city: { label: null, value: null },
          county: { label: null, value: null },
          street: { label: null, value: null },
        });
      }
    }

    if (field === "city") {
      requestData(value).then((arr) => {
        updateState((draft) => {
          draft.countyData = arr;
          draft.streetData = [];
        });
      });
      if (resetRelatedValue) {
        form?.setFieldsValue({
          county: { label: null, value: null },
          street: { label: null, value: null },
        });
      }
    }

    if (field === "county") {
      requestData(value).then((arr) => {
        updateState((draft) => {
          draft.streetData = arr;
        });
      });
      if (resetRelatedValue) {
        form?.setFieldsValue({ street: { label: null, value: null } });
      }
    }
  };

  useEffect(() => {
    requestData("86").then((arr) => {
      updateState((draft) => {
        draft.provinceData = arr;
      });
    });
  }, []);

  useEffect(() => {
    // 当有默认值时，预先加载下拉框内容
    if (defaultInfo.province)
      updateArr("province", defaultInfo.province.value, false);
    if (defaultInfo.city) updateArr("city", defaultInfo.city.value, false);
    if (defaultInfo.county)
      updateArr("county", defaultInfo.county.value, false);
  }, [defaultInfo]);

  return (
    <Form.Item label="项目地址">
      <Row gutter={[16, 16]}>
        <Col span={3}>
          <Form.Item name="province">
            <Select
              placeholder="省份/地区"
              labelInValue
              onChange={(labeledValue: LabeledValue) => {
                updateArr("province", labeledValue.value);
              }}
            >
              <Select.Option value={"" as any}> </Select.Option>
              {provinceData.map((province) => (
                <Select.Option key={province.code} value={province.code}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="city">
            <Select
              placeholder="城市"
              labelInValue
              onChange={(labeledValue: LabeledValue) => {
                updateArr("city", labeledValue.value);
              }}
            >
              <Select.Option value={"" as any}> </Select.Option>
              {cityData.map((city) => (
                <Select.Option key={city.code} value={city.code}>
                  {city.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="county">
            <Select
              placeholder="区/县"
              labelInValue
              onChange={(labeledValue: LabeledValue) => {
                updateArr("county", labeledValue.value);
              }}
            >
              <Select.Option value={"" as any}> </Select.Option>
              {countyData.map((county) => (
                <Select.Option key={county.code} value={county.code}>
                  {county.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="street">
            <Select placeholder="街道/镇" labelInValue>
              <Select.Option value={"" as any}> </Select.Option>
              {streetData.map((street) => (
                <Select.Option key={street.code} value={street.code}>
                  {street.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="detail"
            validateStatus={
              violationFields?.includes("standardProperties.41213129")
                ? "error"
                : ""
            }
            help={
              violationFields?.includes("standardProperties.41213129")
                ? "包含违规内容"
                : ""
            }
          >
            <Input
              placeholder="请输入详细地址"
              maxLength={45}
              onBlur={(e) => {
                form?.setFields([
                  {
                    name: "detail",
                    value: e.target.value.trim(),
                    errors: [],
                  },
                ]);
                setViolation?.(
                  violationFields?.filter(
                    (fd) => fd !== "standardProperties.41213129",
                  ) ?? [],
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );
}

export const formAdressData = (info: any) => {
  const properties = [];
  if (info.detail) {
    properties.push({
      // 详细地址
      propertyId: "41213129",
      stringValue: info.detail,
      valueType: StandardPropertyDTOValueTypeEnum.String,
    });
  }

  if (info?.street?.label?.trim()) {
    properties.push({
      // 乡、街道
      propertyId: "41213119",
      stringValue: info.street?.label,
      extension: info.street?.value,
      valueType: StandardPropertyDTOValueTypeEnum.String,
    });
  }

  if (info?.county?.label?.trim()) {
    properties.push({
      // 区、县
      propertyId: "41213117",
      stringValue: info.county?.label,
      extension: info.county?.value,
      valueType: StandardPropertyDTOValueTypeEnum.String,
    });
  }

  if (info?.city?.label?.trim()) {
    properties.push({
      // 市
      propertyId: "41213115",
      stringValue: info.city?.label,
      extension: info.city?.value,
      valueType: StandardPropertyDTOValueTypeEnum.String,
    });
  }

  if (info?.province?.label?.trim()) {
    properties.push({
      // 直辖市、省、自治区
      propertyId: "41213113",
      stringValue: info.province?.label,
      extension: info.province?.value,
      valueType: StandardPropertyDTOValueTypeEnum.String,
    });
  }

  return properties;
};

export const fetchAdressData = (info: ProjectVO) => {
  const provinceObj = info?.standardProperties?.find(
    (prop) => prop.propertyId === "41213113",
  );
  const hasProvince = provinceObj && provinceObj.extension;

  const cityObj = info?.standardProperties?.find(
    (prop) => prop.propertyId === "41213115",
  );
  const hasCity = cityObj && cityObj.extension;

  const countyObj = info.standardProperties?.find(
    (prop) => prop.propertyId === "41213117",
  );
  const hasCounty = countyObj && countyObj.extension;

  const streetObj = info.standardProperties?.find(
    (prop) => prop.propertyId === "41213119",
  );
  const hasStreet = streetObj && streetObj.extension;

  const detail =
    info.standardProperties?.find((prop) => prop.propertyId === "41213129")
      ?.stringValue ?? "";

  const noAddr =
    !hasProvince && !hasCity && !hasCounty && !hasStreet && !detail;

  return {
    province: hasProvince && {
      label: provinceObj?.stringValue,
      value: provinceObj?.extension,
    },
    city: hasCity && {
      label: cityObj?.stringValue,
      value: cityObj?.extension,
    },
    county: hasCounty && {
      label: countyObj?.stringValue,
      value: countyObj?.extension,
    },
    street: hasStreet && {
      label: streetObj?.stringValue,
      value: streetObj?.extension,
    },
    detail,
    projectLocation: noAddr
      ? ""
      : `${provinceObj?.stringValue ?? ""} / ${cityObj?.stringValue ?? ""} / ${
          countyObj?.stringValue ?? ""
        } / ${streetObj?.stringValue ?? ""} / ${detail}`,
  };
};
