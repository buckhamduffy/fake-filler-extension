import { CreateContextMenus, GetFakeFillerOptions, GetMessage } from "src/common/helpers";

import { MessageRequest, IProfile, IFakeFillerOptions } from "src/types";

async function getCurrentTabId() {
  let tab;
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  // eslint-disable-next-line prefer-const
  [tab] = await chrome.tabs.query(queryOptions);
  return tab?.id ?? -1;
}

function NotifyTabsOfNewOptions(options: IFakeFillerOptions) {
  chrome.tabs.query({}, (tabs: any[]) => {
    tabs.forEach((tab: { id: any }) => {
      if (tab && tab.id && tab.id !== chrome.tabs.TAB_ID_NONE) {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "receiveNewOptions", data: { options } },
          () => chrome.runtime.lastError
        );
      }
    });
  });
}

function handleMessage(
  request: MessageRequest,
  sender: chrome.runtime.MessageSender,
  // eslint-disable-next-line no-unused-vars
  sendResponse: (response: any) => void
): boolean | null {
  switch (request.type) {
    case "getOptions": {
      GetFakeFillerOptions().then((result) => {
        sendResponse({ options: result });
      });
      return true;
    }

    case "setProfileBadge": {
      const profile = request.data as IProfile;
      chrome.action.setBadgeText({ text: "★", tabId: sender.tab?.id });
      chrome.action.setBadgeBackgroundColor({ color: "#D4AF37", tabId: sender.tab?.id });
      chrome.action.setTitle({
        title: `${GetMessage("actionTitle")}\n${GetMessage("matchedProfile")}: ${profile.name}`,
        tabId: sender.tab?.id,
      });
      return true;
    }

    case "setBlockedBadge": {
      const urlToBlock = request.data as string;
      chrome.action.setBadgeText({ text: "X", tabId: sender.tab?.id });
      chrome.action.setBadgeBackgroundColor({ color: "#880000", tabId: sender.tab?.id });
      chrome.action.setTitle({
        title: `${GetMessage("actionTitle")}\n${GetMessage("matchedBlockedURL")}: ${urlToBlock}`,
        tabId: sender.tab?.id,
      });
      return true;
    }

    case "clearProfileBadge": {
      chrome.action.setBadgeText({ text: "", tabId: sender.tab?.id });
      return true;
    }

    case "optionsUpdated": {
      GetFakeFillerOptions().then((options) => {
        NotifyTabsOfNewOptions(options);
      });
      return true;
    }

    default:
      return null;
  }
}

// if (chrome.runtime.onInstalled) {
//   chrome.runtime.onInstalled.addListener((details) => {
//     if (details.reason === "update") {
//       try {
//         if (details.previousVersion && details.previousVersion.startsWith("3.2")) {
//           GetFakeFillerOptions().then((options) => {
//             options.fieldMatchSettings.matchAriaLabelledBy = true;
//             SaveFakeFillerOptions(options);
//           });
//         }
//       } catch (ex) {
//         // eslint-disable-next-line no-alert
//         window.alert(GetMessage("bgPage_errorMigratingOptions", [ex.message]));
//       }
//     }
//   });
// }

chrome.runtime.onMessage.addListener(handleMessage);

function fillAllInputs() {
  if (window.fakeFiller) {
    window.fakeFiller.fillAllInputs();
  }
}

function fillThisForm() {
  window.fakeFiller.fillThisForm();
}

function fillThisInput() {
  window.fakeFiller.fillThisInput();
}

chrome.action.onClicked.addListener(async () => {
  await chrome.scripting.executeScript({
    func: fillAllInputs,
    target: {
      allFrames: true,
      tabId: await getCurrentTabId(),
    },
  });
});

GetFakeFillerOptions().then((options) => {
  CreateContextMenus(options.enableContextMenu);
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "fake-filler-all") {
    await chrome.scripting.executeScript({
      func: fillAllInputs,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
  if (info.menuItemId === "fake-filler-form") {
    await chrome.scripting.executeScript({
      func: fillThisForm,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
  if (info.menuItemId === "fake-filler-input") {
    await chrome.scripting.executeScript({
      func: fillThisInput,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
});

chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === "fill_all_inputs") {
    await chrome.scripting.executeScript({
      func: fillAllInputs,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
  if (command === "fill_this_form") {
    await chrome.scripting.executeScript({
      func: fillThisForm,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
  if (command === "fill_this_input") {
    await chrome.scripting.executeScript({
      func: fillThisInput,
      target: {
        allFrames: true,
        tabId: await getCurrentTabId(),
      },
    });
  }
});
