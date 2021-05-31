/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {FC, useEffect, useContext,useRef } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Select, Spin } from 'antd';
import { useImmer } from "use-immer";
import "./index.scss";
import debounce from 'lodash/debounce';
import { SelectProps } from 'antd/es/select';
// import { AssignmentArchiveVO } from "api/generated/model";
import _ from 'lodash';
import {
    UserVO,
    AssignmentArchiveVO,
    AssignmentArchiveVOStatusEnum,
} from "api/generated/model";

import {
    projectService,
    teamService,
    userService,
    workUnitService,
} from "service";

interface SearchPhoneProps {

}

export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType>, 'options' | 'children'>
{
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
  // list:[]
    data: AssignmentArchiveVO[];
    phones: {};
    setEmptyValue: () => void;
}

interface ValueTypeProps {
    id:string,key: string | undefined;
    label: React.ReactNode;
    value: string | undefined,
    mobile?: string | undefined ;
    fullname: string | undefined;
    status: any;
    nickname: string | null;
}

function DebounceSelect<
    // ValueType extends { id:string,key: string | undefined; label: React.ReactNode; value: string | undefined,mobile?: string | undefined ; fullname: string | undefined;status: any } = any
    ValueType extends ValueTypeProps = any
    // ValueType  = any
    >({ fetchOptions, debounceTimeout = 800,phones={}, ...props }: DebounceSelectProps) {
    const {data} = props;
    console.log(`----data------`)
    console.log(data)
    const dataRef = useRef<AssignmentArchiveVO[]>();
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState<ValueType[]>([]);
  const fetchRef = React.useRef(0);
  const [searchValue,setSearchValue] = React.useState<string | null>(null);

  useEffect(() => {
      dataRef.current = _.clone(data);
  });

  const debounceFetcher = React.useMemo(() => {
      
    const loadOptions = (value: string) => {
        setSearchValue(value);
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
        // props?.setEmptyValue();
      setFetching(true);

      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        const optionArr = cumputerStatus(newOptions);
        setOptions(optionArr);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  // const changeSearchValue = (e : any,option : {}) => {
  //     console.log(`changeSearchValue`);
  //     console.log(e);
  //     console.log(option);
  // }

    const cumputerStatus = (searchList :ValueType[], tableList? : AssignmentArchiveVO[]) => {
        // console.log(`-------searchList----------`);
        // console.log(searchList);
        // console.log(tableList);
        // console.log(data);
        // console.log(dataRef)
        return (_.clone(searchList) || []).map((item) => {
            const res = (dataRef.current || []).find(ele => {
                return item.id === ele.recipient ;
            });
            console.log(`---res--`);
            console.log(res);
            if(res){
                item.status = res.status ;
            }
            return item;
        });
        // return searchList;
    }

    // const changeSelValue = (value : any) => {
    //     console.log(`value`);
    //     console.log(value);
    // }
    //
    // const renderTag = (props : any) => {
    //     console.log(`renderTag`);
    //     console.log(`props`);
    //     return (<span>123</span>)
    // }

  return (
      <Select
          labelInValue
          filterOption={false}
          // onChange={changeSearchValue}
          onSearch={debounceFetcher}
          notFoundContent={fetching ? <Spin size="small" /> : searchValue ?`未搜索到手机号为 "${searchValue}" 的注册用户` : ''}
          {...props}
          // options={options}
          style={{ width: 386 }}
          // dropdownClassName={`sel-jiaofu-man`}
          // onSelect={changeSelValue}
          // tagRender={renderTag}
      >
          {
              (options || []).map((item,index) => {
                  return (
                      <Select.Option key={item.mobile} value = {item?.mobile || ''} disabled={item.status}>
                          <div className={'sel-jiaofu-man'} >
                              <span className={'left'}> {item.fullname ? `${item.fullname}(${item.mobile})` : (item.mobile)}</span>
                              {
                                  item.status ?
                                      <span className={'right'}> {item.status == AssignmentArchiveVOStatusEnum.Disabled ? '交付停用中' : item.status == AssignmentArchiveVOStatusEnum.Enable ?'已交付' : ''}</span>
                                      :
                                      <span className={'right'} style={{opacity:0}}> {'null'}</span>
                              }
                          </div>
                      </Select.Option>
                  )
              })
          }
      </Select>
  );
}

// Usage of DebounceSelect
interface UserValue {
  // label: string;
  value?: string | undefined;
  key?: string | undefined;
}

export  const fetchUserList  = (userId: string) : Promise<UserValue[]>  => {
// async function fetchUserList(userId: string) : Promise<>{
  console.log('fetching userId', userId);

    // const newUserInfo = await userService.userinfoById(userId);
    // console.log(`newUserInfo`);
    // console.log(newUserInfo);
    return userService.userinfoById(userId).then( res => {
        // console.log(`---res---`)
        // console.log(res);
        //mobile字段为null
        const obj = {
            results: res?.mobile ? [{...res}] : [],
        }
        return obj;
    }).then(body => {
        return body.results.map(item => ({
            ...item,
            key: item.mobile,
            // label: (item.fullname || item.nickname) ? `${item.nickname}(${item.mobile})` : `${item.mobile}`,
            value:`${item.mobile}`,
        }));
    });


  /*return fetch('https://randomuser.me/api/?results=5')
      .then(response => response.json())
      .then(body => {
          console.log(`body`);
          console.log(body);
              return body.results.map(
                  (user: { name: { first: string; last: string }; login: { username: string } }) => ({
                      label: `${user.name.first} ${user.name.last}`,
                      value: user.login.username,
                  }),
              )
            }
      );*/
}


/*const Index:FC<SearchPhoneProps> = (props) => {
  const [value, setValue] = React.useState<UserValue[]>([]);
  const [searchValue, setSearchValue] = React.useState<UserValue[]>([]);

  useEffect(() => {

  }, []);

  return (
      <>
        <DebounceSelect
            // mode="multiple"
            showSearch
            value={value}
            // value={searchValue}
            placeholder="请输入想邀请用户的手机号码"
            fetchOptions={fetchUserList}
            onChange={newValue => {
              setValue(newValue);
            }}
            style={{ width: '100%' }}
        />
      </>
  );
}*/

// export default Index;
export default DebounceSelect;

