# Introduction

CdsCTF is a modern open-source Capture The Flag (CTF) platform based on Rust, offering highly customizable features such as problem set design and game hosting.
Originally developed by [ElaBosak233 (Ela)](https://github.com/ElaBosak233) and continuously maintained.

This project is open source under the GPL-3.0 license. Any use or modification must comply with this open source license.

![Index](/images/index.webp)

## Features

### Challenges

- Highly customizable challenges: Supports multiple challenge types and configuration options
- Diverse challenge types:：
  - Attachments: Challenges can carry fixed attachments for download
  - Dynamic environment: Automatically generated and dynamic flags are issued through container environment variables
- More powerful submission check strategies: A more flexible flag checking mechanism based on Rune scripts

### Games

- Dynamic score: A dynamic score calculated based on difficulty coefficient, score upper and lower limits, and the number of ACs (Accepted).
- Ranking rewards: Extra proportions of scores are awarded to teams in the top ranks.
- Flexible challenge management: Challenges can be added or removed at any time during the competition, and freeze time can be set.

### Virtualization

- Dynamic environment management based on Kubernetes: automatic creation, distribution and management of containers
- Resource limits: strict control over CPU, memory and storage resources for each container
- Network isolation control: selective allowance or prohibition of container access to the Internet
- Lifecycle: automatic cleanup of expired environments and support for environment renewal

## Acknowledgements

### Contributors

Thanks to everyone who has contributed to the project! Without you, CdsCTF would not be what it is today.

![Contributors of CdsCTF](https://contrib.rocks/image?repo=cdsctf/cdsctf)

## Stars

![Stars of CdsCTF](https://starchart.cc/cdsctf/cdsctf.svg?variant=adaptive)
