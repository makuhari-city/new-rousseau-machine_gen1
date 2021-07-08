FROM python:3.7

WORKDIR /app
RUN mkdir /app/src

COPY ./requirements.txt /app
COPY ./config.cfg /app

RUN pip install --upgrade pip --no-cache-dir
RUN pip install -r /app/requirements.txt --no-cache-dir

EXPOSE 5000

# ENV PYTHONPATH "${PYTHONPATH}:/app/src/"
# RUN export FLASK_APP="/app/src/app.py"
# CMD echo $FLASK_APP