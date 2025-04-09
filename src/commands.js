const commandMap = [
  {
    predicate: (input) => input.startsWith("welcome"),
    action: (_, push) => {

      push(new Command(`
<pre>
 __      ___                      _     ____                _ _
 \\ \\    / (_)                    | |   |  _ \\              | (_)
  \\ \\  / / _ _ __   ___ ___ _ __ | |_  | |_) |_ __ ___   __| |_ _ __
   \\ \\/ / | | '_ \\ / __/ _ \\ '_ \\| __| |  _ <| '__/ _ \\ / _\` | | '_ \\
    \\  /  | | | | | (_|  __/ | | | |_  | |_) | | | (_) | (_| | | | | |
     \\/   |_|_| |_|\\___\\___|_| |_|\\__| |____/|_|  \\___/ \\__,_|_|_| |_|
</pre>
`, "style"));

      push(new Command(`<p>Welcome to my terminal-style portfolio! This interactive terminal is built with Vue.js and draws inspiration from <a class="underline text-cyan-500" href="https://github.com/satnaing/terminal-portfolio">Sat Naing's terminal-portfolio</a>.</p>`, "style"));
      push(new Command(`<p>Feel free to explore my projects and learn more about my work.`, "style"));
      push(new Command(`<p>To see all commands run the <span class="text-yellow-500">help</span> command`, "style"));
      return { promise: null, cancel: null };
    },
  },
  {
    predicate: (input) => input.startsWith("help"),
    action: (_, push) => {
      push(new Command(`<p>about <span class="opacity-50">- Displays the about page</span></p>`, "style"));
      push(new Command(`<p>echo <span class="opacity-50">- Repeats the input text</span></p>`, "style"));
      push(new Command(`<p>ping <span class="opacity-50">- Sends five ping requests to the specified website</span></p>`, "style"));
      push(new Command(`<p>projects <span class="opacity-50">- Lists all available projects</span></p>`, "style"));
      push(new Command(`<p>github <span class="opacity-50">- Opens the project's GitHub repository</span></p>`, "style"));
      return { promise: null, cancel: null };
    },
  },
  {
    predicate: (input) => input.startsWith("projects"),
    action: (_, push) => {
      push(new Command(`<p><a class="underline text-cyan-500" href="https://gogym.vinbro.se">gogym</a> <span class="opacity-50">- Web app for tracking, storing and improving your workouts, built with go and vue</span> - <a class="underline text-cyan-500" href="https://github.com/VincentBrodin/gogym">Github</a></p>`, "style"));
      push(new Command(`<p><a class="underline text-cyan-500" href="https://blog.vinbro.se">blog</a> <span class="opacity-50">- A SSR blog website that uses markdown styling, built with ASP.NET</span> - <a class="underline text-cyan-500" href="https://github.com/VincentBrodin/blog">Github</a></p>`, "style"));
      push(new Command(`<p>flera <span class="opacity-50">-  A library for effortlessly building and configuring TCP servers and clients, great for both games and apps, built with go´s stdlib</span> - <a class="underline text-cyan-500" href="https://github.com/VincentBrodin/flera">Github</a></p>`, "style"));
      return { promise: null, cancel: null };
    },
  },

  {
    predicate: (input) => input.startsWith("about"),
    action: (_, push) => {
      push(new Command('<p class="text-yellow-500 font-semibold">About</p>', "style"));
      push(new Command('<p>Hi, I\'m <span class="text-yellow-500 font-bold">Vincent Brodin</span>, currently studying to become a System Developer.</p>', "style"));
      push(new Command('<p>Programming is a passion of mine; I love exploring and learning new technologies.</p>', "style"));
      push(new Command('<p>I specialize in <span class="text-yellow-500 font-bold">C#</span>, <span class="text-yellow-500 font-bold">Go</span>, <span class="text-yellow-500 font-bold">Zig</span>, and <span class="text-yellow-500 font-bold">C/C++</span>.</p>', "style"));
      return { promise: null, cancel: null };
    },
  },
  {
    predicate: (input) => input.startsWith("echo"),
    action: (input, push) => {

      const args = getArgs(input);
      args.shift();

      for (let arg of args) {
        push(new Command(arg, "output"));
      }

      return { promise: null, cancel: null };
    },
  },
  {
    predicate: (input) => input.startsWith("ping"),
    action: (input, push) => {
      let isCancelled = false;

      const args = getArgs(input);
      args.shift();

      if (args.length != 1) {
        push(new Command("ping can only take in one argument", "error"));
        return
      }

      const promise = (async () => {
        for (let i = 0; i < 5; i++) {
          if (isCancelled) {
            push(new Command("ping aborted", "error"));
            break
          }

          const img = new Image();
          const start = new Date().getTime();

          img.onload = img.onerror = function() {
            const end = new Date().getTime();
            const duration = end - start;
            push(new Command(`ping to ${args[0]} took ${duration}ms`, "output"));
          };

          img.src = args[0] + '?cache_bust=' + start;
          await new Promise(r => setTimeout(r, 500));
        }
      })();

      return {
        promise,
        cancel: () => { isCancelled = true }
      };
    }
  }
];

export class Command {
  constructor(text, type) {
    this.text = text;
    this.type = type;
  }
}

export function handleCommand(input, push) {
  const match = commandMap.find(entry => entry.predicate(input));
  if (match) {
    return match.action(input, push);
  }
  else {
    push(new Command(`The term ${input} is unkown`, "error"));
  }
}

function getArgs(input) {
  const regex = /"([^"]*)"|(\S+)/g;
  const args = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      args.push(match[1]);
    } else if (match[2] !== undefined) {
      args.push(match[2]);
    }
  }
  return args;
}
