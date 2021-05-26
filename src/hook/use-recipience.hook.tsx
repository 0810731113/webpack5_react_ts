import { Drawer, Input, Button, Table, message, Form } from "antd";
import React, { useEffect, useState } from "react";
import {
  archiveService,
  userService,
  projectService,
  enterpriseService,
} from "service";

import { useRequest } from "@umijs/hooks";
import { AssignmentArchiveVO } from "api/generated/model";

export default function useRecipience(archiveId: string, projectId: string) {
  const [recipiences, setRecipiences] = useState<AssignmentArchiveVO[]>([]);
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});
  const [userPhones, setUserPhones] = useState<{ [userId: string]: string | number }>({});

  const loader = () =>
    archiveService.getArchiveRecipients(archiveId, projectId).then((arr) => {
      setRecipiences(arr ?? []);
      const recipientIds = arr?.map((rep) => rep.recipient!) ?? [];
      const sharerIds = arr?.map((rep) => rep.sharer!) ?? [];
      const allUserIds = [...recipientIds, ...sharerIds];

      if (allUserIds?.length > 0) {
        userService.listUsersByids(allUserIds).then((users) => {
          const tmp: { [userId: string]: string } = {};
          const phones :{[userId: string]: string | number} = {};
          users?.forEach((user) => {
            tmp[user.id!] = user.name ?? "";
              phones[user.id!] = user.telephone ?? ""
          });
          setUserNames(tmp);
          setUserPhones(phones);
        });
      }
    });

  const { loading, data, run } = useRequest(loader, { manual: true });

  return { recipiences, userNames, run, userPhones };
}
